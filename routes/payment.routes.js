module.exports = app => {
    const payments = require("../controllers/payment.controller.js"); // Controller will be created later
    var router = require("express").Router({ mergeParams: true }); // To access :orderId
    // const authMiddleware = require('../middleware/auth');
    // const adminMiddleware = require('../middleware/adminAuth');

    // Create a new Payment for an Order (usually part of checkout flow, or admin manual entry)
    // POST /api/orders/:orderId/payments
    router.post("/", /* authMiddleware or admin, */ payments.create);

    // Retrieve all Payments for a specific Order
    // GET /api/orders/:orderId/payments
    router.get("/", /* authMiddleware or admin, */ payments.findAllByOrder);

    // Retrieve a single Payment with id
    // GET /api/orders/:orderId/payments/:paymentId
    router.get("/:paymentId", /* authMiddleware or admin, */ payments.findOne);

    // Update Payment status (e.g., from 'pending' to 'succeeded' or 'failed', usually by gateway callback or admin)
    // PUT /api/orders/:orderId/payments/:paymentId/status or just /api/payments/:paymentId/status
    // router.put("/:paymentId", /* system/admin, */ payments.updateStatus);

    // Refunds might be a separate process or an update to status.

    app.use('/api/orders/:orderId/payments', router);
    // Or a more general path if payments can be managed outside order context by admins for some reason:
    // app.use('/api/payments', router); // This would require paymentId to be globally unique and order_id in body for creation
    
    // PayPal webhook handler - needs to be outside the nested routes
    app.post('/api/webhooks/paypal', payments.webhookHandler);
}; 