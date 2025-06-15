module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
        order_item_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Orders',
                key: 'order_id'
            }
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'product_id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price_at_purchase: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
        // Optional detailed gold pricing columns from SQL comments can be added here if needed.
        // created_at timestamp handled by Sequelize
    }, {
        tableName: 'OrderItems',
        timestamps: true,
        updatedAt: false // SQL schema only has created_at
    });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, {
            foreignKey: 'order_id',
            onDelete: 'CASCADE'
        });
        OrderItem.belongsTo(models.Product, {
            foreignKey: 'product_id',
            onDelete: 'RESTRICT'
        });
    };

    return OrderItem;
}; 