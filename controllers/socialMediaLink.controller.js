const db = require("../models");
const SocialMediaLink = db.SocialMediaLink;

// Create and Save a new Social Media Link
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.platform_name || !req.body.url) {
        return res.status(400).send({
            message: "Platform name and URL are required!"
        });
    }

    // Create a SocialMediaLink object
    const socialMediaLink = {
        platform_name: req.body.platform_name,
        url: req.body.url,
        icon_class: req.body.icon_class || null,
        display_order: req.body.display_order || 0,
        is_active: req.body.is_active !== undefined ? req.body.is_active : true
    };

    try {
        // Save SocialMediaLink in the database
        const data = await SocialMediaLink.create(socialMediaLink);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Social Media Link."
        });
    }
};

// Retrieve all Social Media Links from the database
exports.findAll = async (req, res) => {
    try {
        const socialMediaLinks = await SocialMediaLink.findAll({
            order: [
                ['display_order', 'ASC'],
                ['platform_name', 'ASC']
            ]
        });
        res.send(socialMediaLinks);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving social media links."
        });
    }
};

// Find a single Social Media Link with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const socialMediaLink = await SocialMediaLink.findByPk(id);
        if (socialMediaLink) {
            res.send(socialMediaLink);
        } else {
            res.status(404).send({
                message: `Cannot find Social Media Link with id=${id}.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving Social Media Link with id=" + id
        });
    }
};

// Update a Social Media Link by the id
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const [num] = await SocialMediaLink.update(req.body, {
            where: { link_id: id }
        });

        if (num == 1) {
            // Get the updated link
            const updatedLink = await SocialMediaLink.findByPk(id);
            res.send(updatedLink);
        } else {
            res.status(404).send({
                message: `Cannot update Social Media Link with id=${id}. Maybe it was not found!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Social Media Link with id=" + id
        });
    }
};

// Delete a Social Media Link with the specified id
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await SocialMediaLink.destroy({
            where: { link_id: id }
        });

        if (num == 1) {
            res.send({
                message: "Social Media Link was deleted successfully!"
            });
        } else {
            res.status(404).send({
                message: `Cannot delete Social Media Link with id=${id}. Maybe it was not found!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Social Media Link with id=" + id
        });
    }
};

// Update the order of Social Media Links
exports.updateOrder = async (req, res) => {
    if (!req.body || !Array.isArray(req.body)) {
        return res.status(400).send({
            message: "Request body must be an array of links with ids and display_order values."
        });
    }

    try {
        // Use a transaction to ensure all updates happen or none do
        const result = await db.sequelize.transaction(async (t) => {
            const updatePromises = req.body.map(item => {
                if (!item.link_id || item.display_order === undefined) {
                    throw new Error("Each item must have link_id and display_order fields.");
                }
                return SocialMediaLink.update(
                    { display_order: item.display_order },
                    { 
                        where: { link_id: item.link_id },
                        transaction: t
                    }
                );
            });
            
            return Promise.all(updatePromises);
        });
        
        // Get all links with the updated order
        const updatedLinks = await SocialMediaLink.findAll({
            order: [
                ['display_order', 'ASC'],
                ['platform_name', 'ASC']
            ]
        });
        
        res.send(updatedLinks);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while updating social media links order."
        });
    }
};

// Toggle active status of a Social Media Link
exports.toggleActive = async (req, res) => {
    const id = req.params.id;
    
    try {
        // Get the current link to get its current is_active status
        const link = await SocialMediaLink.findByPk(id);
        
        if (!link) {
            return res.status(404).send({
                message: `Cannot find Social Media Link with id=${id}.`
            });
        }
        
        // Toggle the is_active status
        const [num] = await SocialMediaLink.update(
            { is_active: !link.is_active },
            { where: { link_id: id } }
        );
        
        if (num == 1) {
            // Get the updated link
            const updatedLink = await SocialMediaLink.findByPk(id);
            res.send(updatedLink);
        } else {
            res.status(500).send({
                message: `Error updating Social Media Link with id=${id}.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error toggling active status for Social Media Link with id=" + id
        });
    }
}; 