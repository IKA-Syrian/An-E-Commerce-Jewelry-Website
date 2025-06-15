module.exports = (sequelize, DataTypes) => {
    const ContactInquiry = sequelize.define('ContactInquiry', {
        inquiry_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        subject: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        received_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        is_resolved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        resolved_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'ContactInquiries',
        timestamps: false // This table has its own timestamp columns (received_at, resolved_at)
        // and no standard created_at/updated_at from the SQL schema
    });

    // No direct associations defined in the SQL for this table
    ContactInquiry.associate = (models) => { };

    return ContactInquiry;
}; 