module.exports = (sequelize, DataTypes) => {
    const CartItem = sequelize.define('CartItem', {
        cart_item_id: {
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
            allowNull: false,
            defaultValue: 1
        },
        price_at_addition: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        gold_price_snapshot_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'GoldPrices',
                key: 'gold_price_id'
            }
        }
        // Timestamps added_at (createdAt) and updated_at (updatedAt) handled by Sequelize
    }, {
        tableName: 'CartItems',
        timestamps: true,
        createdAt: 'added_at', // Map added_at to createdAt
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'product_id'] // Matches UNIQUE KEY (user_id, product_id)
            }
        ]
    });

    CartItem.associate = (models) => {
        CartItem.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        CartItem.belongsTo(models.Product, {
            foreignKey: 'product_id',
            onDelete: 'CASCADE'
        });
        CartItem.belongsTo(models.GoldPrice, {
            foreignKey: 'gold_price_snapshot_id',
            allowNull: true, // Important for optional foreign key
            onDelete: 'SET NULL'
        });
    };

    return CartItem;
}; 