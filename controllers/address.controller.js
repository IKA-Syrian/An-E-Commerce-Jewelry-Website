const db = require("../models");
const Address = db.Address;
const User = db.User; // For ensuring address belongs to user

// Assumes req.user.id is available from an authentication middleware

// Create a new Address for the authenticated user
exports.create = async (req, res) => {
    const userId = req.user.id; // Placeholder
    const {
        address_line1, address_line2, city, state_province, postal_code, country, address_type, is_default
    } = req.body;

    if (!address_line1 || !city || !state_province || !postal_code || !country) {
        return res.status(400).send({
            message: "Address line 1, city, state/province, postal code, and country are required!"
        });
    }

    const address = {
        user_id: userId,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state_province,
        postal_code,
        country,
        address_type: address_type || 'shipping',
        is_default: is_default || false,
    };

    const transaction = await db.sequelize.transaction();
    try {
        // If this new address is set as default, unset other defaults for this user and type
        if (address.is_default) {
            await Address.update(
                { is_default: false },
                { where: { user_id: userId, address_type: address.address_type, is_default: true } },
                { transaction }
            );
        }
        const data = await Address.create(address, { transaction });
        await transaction.commit();
        res.status(201).send(data);
    } catch (err) {
        await transaction.rollback();
        res.status(500).send({ message: err.message || "Some error occurred while creating the Address." });
    }
};

// Retrieve all Addresses for the authenticated user
exports.findAllForUser = async (req, res) => {
    const userId = req.user.id; // Placeholder
    try {
        const data = await Address.findAll({
            where: { user_id: userId },
            order: [['is_default', 'DESC'], ['created_at', 'DESC']]
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while retrieving addresses." });
    }
};

// Retrieve a single Address with id (belonging to the authenticated user)
exports.findOneForUser = async (req, res) => {
    const userId = req.user.id; // Placeholder
    const addressId = req.params.id;
    try {
        const data = await Address.findOne({ where: { address_id: addressId, user_id: userId } });
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({ message: `Cannot find Address with id=${addressId} for this user.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error retrieving Address with id=" + addressId });
    }
};

// Update an Address with id (belonging to the authenticated user)
exports.updateForUser = async (req, res) => {
    const userId = req.user.id; // Placeholder
    const addressId = req.params.id;

    const updateData = { ...req.body };
    delete updateData.user_id; // Prevent changing ownership
    delete updateData.address_id; // Prevent changing ID

    const transaction = await db.sequelize.transaction();
    try {
        const currentAddress = await Address.findOne({ where: { address_id: addressId, user_id: userId }, transaction });
        if (!currentAddress) {
            await transaction.rollback();
            return res.status(404).send({ message: `Address with id=${addressId} not found for this user.` });
        }

        // If updating is_default to true, ensure other addresses of same type are not default
        if (updateData.is_default === true && !currentAddress.is_default) {
            await Address.update(
                { is_default: false },
                { where: { user_id: userId, address_type: currentAddress.address_type, is_default: true, address_id: { [db.Sequelize.Op.ne]: addressId } } },
                { transaction }
            );
        }

        const num = await Address.update(updateData, { where: { address_id: addressId, user_id: userId }, transaction });
        if (num[0] > 0) {
            await transaction.commit();
            res.send({ message: "Address was updated successfully." });
        } else {
            await transaction.rollback();
            res.send({ message: `Cannot update Address with id=${addressId}. Maybe Address was not found or req.body is empty, or no changes were made.` });
        }
    } catch (err) {
        await transaction.rollback();
        res.status(500).send({ message: "Error updating Address with id=" + addressId });
    }
};

// Delete an Address with id (belonging to the authenticated user)
exports.deleteForUser = async (req, res) => {
    const userId = req.user.id; // Placeholder
    const addressId = req.params.id;
    try {
        // Check if address is used in any non-delivered/non-cancelled orders first?
        // For now, direct delete. SQL schema has ON DELETE RESTRICT for Orders, so DB will prevent if in use.
        const num = await Address.destroy({ where: { address_id: addressId, user_id: userId } });
        if (num == 1) {
            res.send({ message: "Address was deleted successfully!" });
        } else {
            res.status(404).send({ message: `Cannot delete Address with id=${addressId}. Maybe it was not found or does not belong to user.` });
        }
    } catch (err) {
        // Catch foreign key constraint errors if address is in use by an Order
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).send({ message: "Cannot delete address. It is currently associated with one or more orders." });
        }
        res.status(500).send({ message: "Could not delete Address with id=" + addressId + ". " + err.message });
    }
};

// Set a specific address as the default for its type for the user
exports.setDefault = async (req, res) => {
    const userId = req.user.id;
    const addressIdToSetDefault = req.params.id;
    const transaction = await db.sequelize.transaction();

    try {
        const address = await Address.findOne({ where: { address_id: addressIdToSetDefault, user_id: userId }, transaction });
        if (!address) {
            await transaction.rollback();
            return res.status(404).send({ message: `Address with id=${addressIdToSetDefault} not found for this user.` });
        }

        // Set all other addresses of the same type for this user to not be default
        await Address.update(
            { is_default: false },
            { where: { user_id: userId, address_type: address.address_type, is_default: true, address_id: { [db.Sequelize.Op.ne]: addressIdToSetDefault } } },
            { transaction }
        );

        // Set the specified address as default
        address.is_default = true;
        await address.save({ transaction });

        await transaction.commit();
        res.send({ message: `Address id ${addressIdToSetDefault} set as default ${address.address_type} address.` });

    } catch (err) {
        await transaction.rollback();
        res.status(500).send({ message: "Error setting default address. " + err.message });
    }
}; 