module.exports = (sequelize, DataTypes) => {
    const SocialMediaLink = sequelize.define('SocialMediaLink', {
        link_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        platform_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        icon_class: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
        // Timestamps created_at, updated_at handled by Sequelize
    }, {
        tableName: 'SocialMediaLinks',
        timestamps: true
    });

    // No direct associations defined in the SQL for this table
    SocialMediaLink.associate = (models) => { };

    return SocialMediaLink;
}; 