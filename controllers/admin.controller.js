const db = require("../models");
const { QueryTypes } = require('sequelize');
const User = db.User;
const Order = db.Order;
const Product = db.Product;

// Get dashboard statistics for admin
exports.getDashboardStats = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await User.count();
        
        // Get total orders count
        const totalOrders = await Order.count();
        
        // Get total products count
        const totalProducts = await Product.count();
        
        // Get total revenue
        const totalRevenueResult = await db.sequelize.query(
            'SELECT SUM(total_amount) as total FROM Orders',
            { type: QueryTypes.SELECT }
        );
        const totalRevenue = totalRevenueResult[0].total || 0;
        
        // Get pending orders count
        const pendingOrders = await Order.count({
            where: {
                status: 'pending_payment'
            }
        });
        
        // Get recent orders
        const recentOrders = await Order.findAll({
            order: [['order_date', 'DESC']],
            limit: 5,
            include: [
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'email']
                }
            ]
        });
        
        res.status(200).send({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            pendingOrders,
            recentOrders
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving dashboard stats."
        });
    }
}; 