module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
        // Timestamps (created_at, updated_at) are automatically handled by Sequelize
        // if not specified otherwise or if `timestamps: true` (default) is set.
    }, {
        tableName: 'Users',
        timestamps: true, // Sequelize will manage createdAt and updatedAt
        // If your SQL table already has these columns with specific names,
        // you can map them:
        // createdAt: 'created_at',
        // updatedAt: 'updated_at'
        // However, the provided SQL uses CURRENT_TIMESTAMP defaults which Sequelize handles well.
    });

    User.associate = (models) => {
        // A User can have multiple Addresses
        User.hasMany(models.Address, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE' // If a user is deleted, their addresses are also deleted
        });

        // A User can have multiple CartItems
        User.hasMany(models.CartItem, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE' // If a user is deleted, their cart items are also deleted
        });

        // A User can have multiple Orders
        User.hasMany(models.Order, {
            foreignKey: 'user_id',
            onDelete: 'RESTRICT' // Prevent deleting a user if they have orders
        });

        // A User (admin) can update multiple SiteContent entries
        User.hasMany(models.SiteContent, {
            foreignKey: 'last_updated_by',
            as: 'AuthoredSiteContent', // Alias to distinguish from other user associations
            onDelete: 'SET NULL' // If admin user is deleted, set last_updated_by to NULL
        });
    };

    return User;
}; 