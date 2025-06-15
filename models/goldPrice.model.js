module.exports = (sequelize, DataTypes) => {
    const GoldPrice = sequelize.define('GoldPrice', {
        gold_price_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        price_per_gram_24k: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            unique: true
        },
        source_api: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        tableName: 'GoldPrices',
        timestamps: false // This table has its own timestamp column and no updated_at
    });

    GoldPrice.associate = (models) => {
        // A GoldPrice snapshot can be referenced by multiple CartItems
        GoldPrice.hasMany(models.CartItem, {
            foreignKey: 'gold_price_snapshot_id',
            onDelete: 'SET NULL' // If a gold price snapshot is deleted, set the FK in CartItem to NULL
        });
    };

    return GoldPrice;
}; 