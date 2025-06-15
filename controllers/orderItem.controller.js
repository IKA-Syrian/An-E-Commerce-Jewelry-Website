const db = require("../models");
const OrderItem = db.OrderItem;
const Order = db.Order;
const Product = db.Product;

// Assumes req.user.id and potentially req.user.isAdmin are available from auth middleware

// Retrieve all OrderItems for a specific Order
exports.findAllByOrder = async (req, res) => {
    const orderId = req.params.orderId;
    // const userId = req.user.id; // Placeholder
    // const isAdmin = req.user.isAdmin; // Placeholder

    try {
        // First, verify the order exists and (if not admin) belongs to the user
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).send({ message: `Order with id=${orderId} not found.` });
        }
        // if (!isAdmin && order.user_id !== userId) {
        //   return res.status(403).send({ message: "Access denied to this order's items." });
        // }

        const orderItems = await OrderItem.findAll({
            where: { order_id: orderId },
            include: [
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['product_id', 'name', 'sku', 'slug'] // Include relevant product details
                    // You might want to include ProductImage here too for display purposes
                }
            ],
            order: [['created_at', 'ASC']]
        });
        res.send(orderItems);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving order items."
        });
    }
};

// Find a single OrderItem (less common, usually part of findAllByOrder)
// exports.findOne = async (req, res) => {
//   const itemId = req.params.itemId;
//   const orderId = req.params.orderId;
//   // ... add similar authorization checks as above ...
//   try {
//     const item = await OrderItem.findOne({
//         where: { order_item_id: itemId, order_id: orderId },
//         include: [{ model: Product, as: 'Product' }]
//     });
//     if (item) {
//       res.send(item);
//     } else {
//       res.status(404).send({ message: `OrderItem with id=${itemId} not found in order ${orderId}.` });
//     }
//   } catch (err) {
//     res.status(500).send({ message: `Error retrieving OrderItem with id=${itemId}.` });
//   }
// };

// Individual creation, update, deletion of order items post-order creation is typically not done.
// These are usually handled as part of a returns/refunds/order modification process at a higher level. 