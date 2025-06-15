module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        order_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        order_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.ENUM('pending_payment', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
            allowNull: false,
            defaultValue: 'pending_payment'
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        shipping_address_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Addresses',
                key: 'address_id'
            }
        },
        billing_address_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Addresses',
                key: 'address_id'
            }
        },
        shipping_method: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        tracking_number: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        customer_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
        // Timestamps created_at, updated_at handled by Sequelize
    }, {
        tableName: 'Orders',
        timestamps: true
    });

    Order.associate = (models) => {
        Order.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'RESTRICT'
        });
        Order.belongsTo(models.Address, {
            foreignKey: 'shipping_address_id',
            as: 'ShippingAddress', // Alias for this association
            onDelete: 'RESTRICT'
        });
        Order.belongsTo(models.Address, {
            foreignKey: 'billing_address_id',
            as: 'BillingAddress', // Alias for this association
            onDelete: 'RESTRICT'
        });

        // An Order can have multiple OrderItems
        Order.hasMany(models.OrderItem, {
            foreignKey: 'order_id',
            onDelete: 'CASCADE' // If an order is deleted, its items are also deleted
        });

        // An Order can have multiple Payments
        Order.hasMany(models.Payment, {
            foreignKey: 'order_id',
            onDelete: 'CASCADE' // If an order is deleted, its payments are also deleted
        });
    };

    return Order;
}; 