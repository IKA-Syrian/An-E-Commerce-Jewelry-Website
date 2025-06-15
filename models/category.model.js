module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        category_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true
        }
        // Timestamps handled by Sequelize
    }, {
        tableName: 'Categories',
        timestamps: true
    });

    Category.associate = (models) => {
        // A Category can have multiple Products
        Category.hasMany(models.Product, {
            foreignKey: 'category_id',
            onDelete: 'SET NULL' // If a category is deleted, set category_id to NULL in Products
        });
    };

    return Category;
}; 