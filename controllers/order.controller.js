const db = require("../models");
const Order = db.Order;
const OrderItem = db.OrderItem;
const CartItem = db.CartItem;
const Product = db.Product;
const Address = db.Address;
const User = db.User; // For eager loading
const Image = db.Image;
const ProductImage = db.ProductImage;
const sequelize = db.sequelize; // For transactions


// Assumes req.user.id is available from an authentication middleware

// Create a new Order from the user's cart
exports.create = async (req, res) => {
    // Get user ID from auth or from request for guest checkout
    const userId = req.user ? req.user.id : null;

    const {
        shipping_address,
        billing_address,
        email,
        shipping_method,
        notes,
        items,
        total_amount,
        payment
    } = req.body;

    if (!shipping_address || !billing_address) {
        return res.status(400).send({ message: "Shipping and billing addresses are required." });
    }

    const transaction = await sequelize.transaction(); // Start a transaction

    try {
        let shippingAddressId, billingAddressId;

        // Handle shipping address (either use existing by ID or create new)
        if (shipping_address.address_id) {
            // Using an existing address
            shippingAddressId = shipping_address.address_id;

            // Verify address belongs to the user (skip for guest checkout)
            if (userId) {
                const shippingAddr = await Address.findOne({
                    where: { address_id: shippingAddressId, user_id: userId }
                });

                if (!shippingAddr) {
                    await transaction.rollback();
                    return res.status(403).send({ message: "Invalid shipping address for this user." });
                }
            }
        } else {
            // Create a new address
            const newShippingAddress = await Address.create({
                user_id: userId, // Will be null for guest checkout
                full_name: shipping_address.full_name,
                address_line1: shipping_address.address_line1,
                address_line2: shipping_address.address_line2 || null,
                city: shipping_address.city,
                state: shipping_address.state,
                postal_code: shipping_address.postal_code,
                country: shipping_address.country,
                phone: shipping_address.phone,
                is_default: false
            }, { transaction });

            shippingAddressId = newShippingAddress.address_id;
        }

        // Handle billing address (either use existing by ID, create new, or use same as shipping)
        if (billing_address.same_as_shipping) {
            billingAddressId = shippingAddressId;
        } else if (billing_address.address_id) {
            // Using an existing address
            billingAddressId = billing_address.address_id;

            // Verify address belongs to the user (skip for guest checkout)
            if (userId) {
                const billingAddr = await Address.findOne({
                    where: { address_id: billingAddressId, user_id: userId }
                });

                if (!billingAddr) {
                    await transaction.rollback();
                    return res.status(403).send({ message: "Invalid billing address for this user." });
                }
            }
        } else {
            // Create a new address
            const newBillingAddress = await Address.create({
                user_id: userId, // Will be null for guest checkout
                full_name: billing_address.full_name,
                address_line1: billing_address.address_line1,
                address_line2: billing_address.address_line2 || null,
                city: billing_address.city,
                state: billing_address.state,
                postal_code: billing_address.postal_code,
                country: billing_address.country,
                phone: billing_address.phone,
                is_default: false
            }, { transaction });

            billingAddressId = newBillingAddress.address_id;
        }

        // Get order items either from cart or from request body for direct checkout
        let orderItems = [];
        let orderTotal = total_amount;

        if (items && items.length > 0) {
            // Direct checkout with items provided
            orderItems = items;
        } else if (userId) {
            // Get from user's cart
            const cartItems = await CartItem.findAll({
                where: { user_id: userId },
                include: [{ model: Product, as: 'Product' }]
            });

            if (cartItems.length === 0) {
                await transaction.rollback();
                return res.status(400).send({ message: "Cart is empty. Cannot create order." });
            }

            // Calculate total amount and prepare order items
            orderTotal = 0;
            for (const item of cartItems) {
                if (!item.Product) {
                    await transaction.rollback();
                    return res.status(500).send({ message: `Product details missing for cart item ID: ${item.cart_item_id}` });
                }
                // Check stock before proceeding
                if (item.Product.stock_quantity < item.quantity) {
                    await transaction.rollback();
                    return res.status(400).send({ message: `Not enough stock for product: ${item.Product.name}. Requested: ${item.quantity}, Available: ${item.Product.stock_quantity}` });
                }

                const itemTotal = item.price_at_addition * item.quantity;
                orderTotal += itemTotal;
                orderItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price_at_addition,
                });
            }
        } else {
            await transaction.rollback();
            return res.status(400).send({ message: "No items provided for order." });
        }

        // Create the Order
        const order = await Order.create({
            user_id: userId,
            status: 'pending_payment', // Initial status
            total_amount: orderTotal,
            shipping_address_id: shippingAddressId,
            billing_address_id: billingAddressId,
            shipping_method: shipping_method || 'standard',
            customer_notes: notes || null,
            email: email // Store email for guest checkout
        }, { transaction });

        // Create OrderItems and link them to the Order
        for (const item of orderItems) {
            await OrderItem.create({
                order_id: order.order_id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: item.price
            }, { transaction });

            // Decrement product stock
            await Product.update(
                { stock_quantity: sequelize.literal(`stock_quantity - ${item.quantity}`) },
                { where: { product_id: item.product_id }, transaction }
            );
        }

        // Process payment if provided
        if (payment) {
            await db.Payment.create({
                order_id: order.order_id,
                amount: payment.amount,
                payment_method: payment.payment_method,
                transaction_id: payment.transaction_id,
                status: payment.status,
                gateway_response: payment.gateway_response
            }, { transaction });

            // Update order status if payment is succeeded
            if (payment.status === 'succeeded') {
                await order.update({ status: 'processing' }, { transaction });
            }
        }

        // Clear the user's cart if using cart-based checkout
        if (userId && !items) {
            await CartItem.destroy({ where: { user_id: userId }, transaction });
        }

        await transaction.commit(); // Commit the transaction

        // Return the order with a success message
        res.status(201).send({
            message: "Order created successfully",
            order_id: order.order_id,
            status: order.status,
            total_amount: order.total_amount
        });

    } catch (err) {
        await transaction.rollback(); // Rollback transaction on error
        res.status(500).send({ message: err.message || "Failed to create order." });
    }
};

// Retrieve all Orders (admin gets all, user gets their own)
exports.findAll = async (req, res) => {
    // Extract query parameters for filtering, pagination, sorting
    const {
        search,
        status,
        sort_by = 'order_date',
        sort_direction = 'DESC',
        page,
        limit
    } = req.query;

    // const userId = req.user?.id; // Placeholder
    // const isAdmin = req.user?.isAdmin; // Placeholder for admin role check

    // Build the WHERE condition
    let condition = {};

    // If not admin, only show user's own orders (when auth is implemented)
    // if (!isAdmin) {
    //     condition.user_id = userId;
    // }

    // Filter by status if provided
    if (status && status !== 'all') {
        condition.status = status;
    }

    // Search by order ID or in related user info
    if (search) {
        try {
            const { Op } = require("sequelize");
            // Allow searching by order_id if it's a number
            const searchAsNumber = !isNaN(search) ? parseInt(search) : null;

            // Include conditions for searching
            condition = {
                ...condition,
                [Op.or]: [
                    // Search in order_id if it could be a number
                    ...(searchAsNumber ? [{ order_id: searchAsNumber }] : []),
                    // Use Sequelize.literal for joins (searching in user's name/email)
                    sequelize.literal(`User.first_name LIKE '%${search}%' OR User.last_name LIKE '%${search}%' OR User.email LIKE '%${search}%'`)
                ]
            };
        } catch (error) {
            console.error("Search query error:", error);
        }
    }

    try {
        // First, get the total count
        const count = await Order.count({
            where: condition,
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: [], // Include User but don't select fields, just for the join condition
                    required: search ? true : false // Inner join only if searching by user info
                }
            ],
            distinct: true // Needed when using includes to get accurate count
        });

        // Build query options for the actual data
        const options = {
            where: condition,
            include: [
                { model: User, as: 'User', attributes: ['user_id', 'first_name', 'last_name', 'email'] },
                { model: Address, as: 'ShippingAddress' },
                { model: Address, as: 'BillingAddress' },
                {
                    model: OrderItem,
                    as: 'OrderItems',
                    include: [{
                        model: Product,
                        as: 'Product',
                        attributes: ['product_id', 'name', 'sku'],
                        include: [{
                            model: ProductImage,
                            as: 'ProductImages',
                            attributes: ['image_id', 'product_id', 'image_url', 'is_primary'],
                            limit: 1,
                            where: { is_primary: true },
                            required: false
                        }]
                    }]
                },
                { model: db.Payment, as: 'Payments' }
            ]
        };

        // Add sorting if specified
        if (sort_by) {
            // Special case for sorting by customer name, which is in the User model
            if (sort_by === 'customer_name') {
                options.order = [
                    [{ model: User, as: 'User' }, 'first_name', sort_direction === 'DESC' ? 'DESC' : 'ASC']
                ];
            } else {
                options.order = [
                    [sort_by, sort_direction === 'DESC' ? 'DESC' : 'ASC']
                ];
            }
        } else {
            // Default sort by order_date descending (newest first)
            options.order = [['order_date', 'DESC']];
        }

        // Add pagination if both page and limit are specified
        if (page !== undefined && limit !== undefined) {
            const pageNumber = parseInt(page);
            const pageSize = parseInt(limit);
            options.offset = (pageNumber - 1) * pageSize;
            options.limit = pageSize;
        } else if (limit !== undefined) {
            // Just limit the results if only limit is specified
            options.limit = parseInt(limit);
        }

        // Get the orders with pagination
        const orders = await Order.findAll(options);

        // Determine if we should use the old or new response format
        // For backward compatibility, use the old format (just the array) if no pagination parameters are used
        const isPaginationRequest = page !== undefined || limit !== undefined;

        if (isPaginationRequest) {
            // Return both the orders and pagination metadata
            res.send({
                totalItems: count,
                orders: orders,
                currentPage: page ? parseInt(page) : 1,
                totalPages: limit ? Math.ceil(count / parseInt(limit)) : 1
            });
        } else {
            // For backward compatibility, return just the orders array
            res.send(orders);
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving orders."
        });
    }
};

// Find orders for a specific user
exports.findByUserId = async (req, res) => {
    const userId = req.params.userId;
    // Check if the user is authorized to see these orders
    // Allow if the user is an admin OR if they're accessing their own orders
    if (!req.user.is_admin && req.user.id !== parseInt(userId)) {
        return res.status(403).send({ message: "Access denied. You can only view your own orders." });
    }

    try {
        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                { model: User, as: 'User', attributes: ['user_id', 'first_name', 'last_name', 'email'] },
                { model: Address, as: 'ShippingAddress' },
                { model: Address, as: 'BillingAddress' },
                {
                    model: OrderItem,
                    as: 'OrderItems',
                    include: [{
                        model: Product,
                        as: 'Product',
                        attributes: ['product_id', 'name', 'sku'],
                        include: [{
                            model: ProductImage,
                            as: 'ProductImages',
                            attributes: ['image_id', 'product_id', 'image_url', 'is_primary']
                        }]
                    }]
                },
                { model: db.Payment, as: 'Payments' }
            ],
            order: [['order_date', 'DESC']]
        });
        res.send(orders);
    } catch (err) {
        console.error("Error retrieving user orders:", err);
        res.status(500).send({ message: err.message || `Error retrieving orders for user with id=${userId}` });
    }
};

// Find a single Order with an id
exports.findOne = async (req, res) => {
    const orderId = req.params.id;
    // const userId = req.user.id; // Placeholder
    // const isAdmin = req.user.isAdmin; // Placeholder

    try {
        const order = await db.Order.findByPk(orderId, {
            include: [
                { model: db.User, as: 'User', attributes: ['user_id', 'first_name', 'last_name', 'email'] },
                { model: db.Address, as: 'ShippingAddress' },
                { model: db.Address, as: 'BillingAddress' },
                {
                    model: db.OrderItem,
                    as: 'OrderItems',
                    include: [{
                        model: db.Product,
                        as: 'Product',
                        include: [{
                            model: db.ProductImage,
                            as: 'ProductImages',
                            attributes: ['image_id', 'product_id', 'image_url', 'is_primary']
                        }]
                    }]
                },
                { model: db.Payment, as: 'Payments' }
            ]
        });

        if (!order) {
            return res.status(404).send({ message: `Order with id=${orderId} not found.` });
        }

        // if (!isAdmin && order.user_id !== userId) {
        //   return res.status(403).send({ message: "Access denied." });
        // }

        res.send(order);
    } catch (err) {
        console.error("Error retrieving order:", err);
        res.status(500).send({
            message: "Error retrieving order with id=" + orderId,
            details: err.message
        });
    }
};

// Update an Order's status (typically by admin)
exports.updateStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).send({ message: "Status is required." });
    }
    // TODO: Validate if status is a valid ENUM value from Order model

    try {
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).send({ message: `Order with id=${orderId} not found.` });
        }

        // Add more logic here: e.g., if changing to 'shipped', require tracking_number
        // If changing from 'shipped' to 'processing', that might not be allowed.
        // If status is 'delivered' or 'cancelled', prevent further status changes.

        order.status = status;
        if (req.body.tracking_number && status === 'shipped') {
            order.tracking_number = req.body.tracking_number;
        }
        await order.save();
        res.send({ message: "Order status updated successfully.", order });
    } catch (err) {
        res.status(500).send({ message: "Error updating order status: " + err.message });
    }
};

// Placeholder for cancelling an order (user action, if allowed by status)
// exports.cancelOrder = async (req, res) => { ... }; 