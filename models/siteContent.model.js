module.exports = (sequelize, DataTypes) => {
    const SiteContent = sequelize.define('SiteContent', {
        content_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        content_key: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        content_value: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        last_updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        }
        // updated_at is handled by Sequelize by default if timestamps: true
        // The SQL schema uses ON UPDATE CURRENT_TIMESTAMP for updated_at which Sequelize handles.
        // No created_at in the SQL schema for this table.
    }, {
        tableName: 'SiteContent',
        timestamps: true,
        createdAt: false, // No created_at column in the SQL schema
        updatedAt: 'updated_at' // Map updatedAt to the existing updated_at column
    });

    SiteContent.associate = (models) => {
        SiteContent.belongsTo(models.User, {
            foreignKey: 'last_updated_by',
            as: 'LastUpdatedByAdmin', // Alias for this association
            allowNull: true,
            onDelete: 'SET NULL'
        });
    };

    return SiteContent;
}; 