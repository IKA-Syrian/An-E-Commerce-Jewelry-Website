module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        product_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Categories',
                key: 'category_id'
            }
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        sku: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: true
        },
        base_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        weight_grams: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        karat: {
            type: DataTypes.ENUM('14K', '18K', '21K', '22K', '24K'),
            allowNull: true
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        slug: {
            type: DataTypes.STRING(280),
            allowNull: false,
            unique: true
        }
        // Timestamps handled by Sequelize
    }, {
        tableName: 'Products',
        timestamps: true
    });

    Product.associate = (models) => {
        Product.belongsTo(models.Category, {
            foreignKey: 'category_id',
            onDelete: 'SET NULL' // Matches ON DELETE SET NULL
        });

        // A Product can have multiple ProductImages
        Product.hasMany(models.ProductImage, {
            foreignKey: 'product_id',
            onDelete: 'CASCADE' // If a product is deleted, its images are also deleted
        });

        // A Product can be in multiple CartItems
        Product.hasMany(models.CartItem, {
            foreignKey: 'product_id',
            onDelete: 'CASCADE' // If a product is deleted, its cart items are also deleted
        });

        // A Product can be in multiple OrderItems
        Product.hasMany(models.OrderItem, {
            foreignKey: 'product_id',
            onDelete: 'RESTRICT' // Prevent deleting a product if it's in an order
        });
    };

    return Product;
}; 