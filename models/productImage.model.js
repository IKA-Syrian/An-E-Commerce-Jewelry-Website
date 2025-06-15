module.exports = (sequelize, DataTypes) => {
    const ProductImage = sequelize.define('ProductImage', {
        image_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'product_id'
            }
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        alt_text: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        is_primary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
        // Timestamps handled by Sequelize
    }, {
        tableName: 'ProductImages',
        timestamps: true,
        createdAt: 'created_at', // Explicitly map if your column name is different or to be sure
        updatedAt: false // SQL has no updated_at for this table
    });

    ProductImage.associate = (models) => {
        ProductImage.belongsTo(models.Product, {
            foreignKey: 'product_id',
            onDelete: 'CASCADE'
        });
    };

    return ProductImage;
}; 