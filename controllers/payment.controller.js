const db = require("../models");
const Payment = db.Payment;
const Order = db.Order;

// Assumes req.user.id and potentially req.user.isAdmin for authorization

// Create a new Payment for an Order
exports.create = async (req, res) => {
    const orderId = req.params.orderId; // From nested route, or req.body.order_id if not nested
    const { amount, payment_method, transaction_id, status, gateway_response } = req.body;

    if (!orderId || !amount || !payment_method || !transaction_id || !status) {
        return res.status(400).send({
            message: "Order ID, amount, payment method, transaction ID, and status are required."
        });
    }

    try {
        // Verify the order exists
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).send({ message: `Order with id=${orderId} not found.` });
        }
        // Optional: Check if order.user_id matches req.user.id if it's a user action

        const payment = {
            order_id: orderId,
            amount: amount,
            payment_method: payment_method,
            transaction_id: transaction_id,
            status: status, // e.g., 'pending', 'succeeded', 'failed'
            gateway_response: gateway_response || null,
            // payment_date is defaulted by model/DB
        };

        const data = await Payment.create(payment);
        // Potentially update Order status based on payment success here or in a separate step
        // e.g., if payment succeeded, order status moves from 'pending_payment' to 'processing'
        if (data.status === 'succeeded' && order.status === 'pending_payment') {
            order.status = 'processing';
            await order.save();
        }

        res.status(201).send(data);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while creating the Payment." });
    }
};

// Retrieve all Payments for a specific Order
exports.findAllByOrder = async (req, res) => {
    const orderId = req.params.orderId;
    // Add authorization checks: user can see their order's payments, admin can see all.

    try {
        const order = await Order.findByPk(orderId); // Verify order exists
        if (!order) return res.status(404).send({ message: `Order with id=${orderId} not found.` });

        // Authorization: e.g., if (req.user.id !== order.user_id && !req.user.isAdmin) return res.status(403).send(...);

        const payments = await Payment.findAll({
            where: { order_id: orderId },
            order: [['payment_date', 'DESC']]
        });
        res.send(payments);
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while retrieving payments." });
    }
};

// Find a single Payment with an id
exports.findOne = async (req, res) => {
    const paymentId = req.params.paymentId;
    const orderId = req.params.orderId; // For context and authorization

    try {
        const payment = await Payment.findOne({
            where: { payment_id: paymentId, order_id: orderId }
        });
        if (payment) {
            // Add authorization checks here too
            res.send(payment);
        } else {
            res.status(404).send({ message: `Payment with id=${paymentId} for order ${orderId} not found.` });
        }
    } catch (err) {
        res.status(500).send({ message: `Error retrieving Payment with id=${paymentId}.` });
    }
};

// Update Payment status (e.g., by a payment gateway callback or admin action)
// exports.updateStatus = async (req, res) => { ... }; // More complex, involves security (webhook validation)

// Deleting payments is generally not done; refunds are new transactions or status updates.

// Handle PayPal webhook notifications
exports.webhookHandler = async (req, res) => {
    try {
        const event = req.body;
        
        // Verify the webhook signature (in production, you would verify this against PayPal)
        // For sandbox testing, we'll accept all webhook events
        
        // Process the event based on its type
        switch (event.event_type) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                // Payment was successfully captured
                const paymentId = event.resource.id;
                const payment = await Payment.findOne({
                    where: { transaction_id: paymentId }
                });

                if (payment) {
                    // Update payment status if needed
                    if (payment.status !== 'succeeded') {
                        payment.status = 'succeeded';
                        payment.gateway_response = JSON.stringify(event);
                        await payment.save();
                        
                        // Update order status
                        const order = await Order.findByPk(payment.order_id);
                        if (order && order.status === 'pending_payment') {
                            order.status = 'processing';
                            await order.save();
                        }
                    }
                }
                break;
                
            case 'PAYMENT.CAPTURE.DENIED':
            case 'PAYMENT.CAPTURE.REFUNDED':
            case 'PAYMENT.CAPTURE.REVERSED':
                // Payment failed or was refunded
                const failedPaymentId = event.resource.id;
                const failedPayment = await Payment.findOne({
                    where: { transaction_id: failedPaymentId }
                });

                if (failedPayment) {
                    // Update payment status
                    failedPayment.status = event.event_type === 'PAYMENT.CAPTURE.DENIED' ? 'failed' : 'refunded';
                    failedPayment.gateway_response = JSON.stringify(event);
                    await failedPayment.save();
                    
                    // Update order status if needed
                    const order = await Order.findByPk(failedPayment.order_id);
                    if (order) {
                        order.status = event.event_type === 'PAYMENT.CAPTURE.DENIED' ? 'payment_failed' : 'refunded';
                        await order.save();
                    }
                }
                break;
                
            // Handle other event types as needed
            default:
                console.log(`Unhandled event type: ${event.event_type}`);
        }
        
        // Return a 200 response to acknowledge receipt of the event
        res.status(200).send({ received: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(400).send({ error: 'Webhook processing failed' });
    }
}; 