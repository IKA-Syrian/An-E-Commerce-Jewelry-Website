module.exports = app => {
    const orderItems = require("../controllers/orderItem.controller.js"); // Controller will be created later
    var router = require("express").Router({ mergeParams: true }); // mergeParams allows access to :orderId
    // const authMiddleware = require('../middleware/auth');

    // Retrieve all OrderItems for a specific Order
    // GET /api/orders/:orderId/items
    router.get("/", /* authMiddleware, */ orderItems.findAllByOrder); // User should only access their own order's items

    // Retrieve a single OrderItem (perhaps not commonly needed directly if all items fetched with order)
    // GET /api/orders/:orderId/items/:itemId
    // router.get("/:itemId", /* authMiddleware, */ orderItems.findOne);

    // OrderItems are typically created when an order is created and not managed individually via API after that.
    // Updates or deletions would usually be part of a return/refund process handled at the Order level.

    app.use('/api/orders/:orderId/items', router);
}; 