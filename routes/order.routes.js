module.exports = app => {
    const orders = require("../controllers/order.controller.js"); // Controller will be created later
    var router = require("express").Router();
    const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

    // Create a new Order (user action from their cart)
    router.post("/", authMiddleware, orders.create);

    // Retrieve all Orders (admin gets all, user gets their own)
    router.get("/", authMiddleware, orders.findAll); // Auth middleware will handle differentiating user/admin

    // Add endpoint to get orders for a specific user (admin only)
    router.get("/user/:userId", authMiddleware, orders.findByUserId);

    // Retrieve a single Order with id (user gets their own, admin can get any)
    router.get("/:id", authMiddleware, orders.findOne);

    // Update an Order status (admin only)
    router.put("/:id/status", adminAuthMiddleware, orders.updateStatus);

    // User might cancel an order if status allows
    // router.put("/:id/cancel", authMiddleware, orders.cancelOrder);

    // No direct deletion of orders is typical, usually statuses like 'cancelled' or 'refunded' are used.
    // router.delete("/:id", orders.delete);

    app.use('/api/orders', router);
}; 