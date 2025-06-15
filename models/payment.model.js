module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        payment_id: {
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
        payment_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        transaction_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'refunded'),
            allowNull: false,
            defaultValue: 'pending'
        },
        gateway_response: {
            type: DataTypes.TEXT,
            allowNull: true
        }
        // Timestamps created_at, updated_at handled by Sequelize
    }, {
        tableName: 'Payments',
        timestamps: true
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.Order, {
            foreignKey: 'order_id',
            onDelete: 'CASCADE'
        });
    };

    return Payment;
}; 