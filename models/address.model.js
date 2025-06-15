module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
        address_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // This is the table name
                key: 'user_id'
            }
        },
        address_line1: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        address_line2: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        state_province: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        postal_code: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        address_type: {
            type: DataTypes.ENUM('shipping', 'billing'),
            defaultValue: 'shipping'
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
        // Timestamps (created_at, updated_at) handled by Sequelize
    }, {
        tableName: 'Addresses',
        timestamps: true,
        underscored: true, // Use snake_case for automatically added timestamps
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Address.associate = (models) => {
        Address.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE' // Matches ON DELETE CASCADE in SQL
        });

        // An Address can be used as a shipping address in multiple Orders
        Address.hasMany(models.Order, {
            foreignKey: 'shipping_address_id',
            as: 'ShippingOrders',
            onDelete: 'RESTRICT' // Prevent deleting address if used in orders
        });

        // An Address can be used as a billing address in multiple Orders
        Address.hasMany(models.Order, {
            foreignKey: 'billing_address_id',
            as: 'BillingOrders',
            onDelete: 'RESTRICT' // Prevent deleting address if used in orders
        });
    };

    return Address;
}; 