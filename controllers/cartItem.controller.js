const db = require("../models");
const CartItem = db.CartItem;
const Product = db.Product;
const GoldPrice = db.GoldPrice; // If you store gold price snapshot ID

// Assumes req.user.id is available from an authentication middleware

// Add an item to the cart, or update quantity if it already exists
exports.addItem = async (req, res) => {
    const userId = req.user.id; // Placeholder for authenticated user ID
    const { product_id, quantity, price_at_addition, gold_price_snapshot_id } = req.body;

    if (!product_id || !quantity || price_at_addition === undefined) {
        return res.status(400).send({ message: "Product ID, quantity, and price_at_addition are required." });
    }
    if (parseInt(quantity) <= 0) {
        return res.status(400).send({ message: "Quantity must be a positive integer." });
    }

    try {
        // Check if product exists and has enough stock
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).send({ message: `Product with id=${product_id} not found.` });
        }
        if (product.stock_quantity < quantity) {
            // Or if it's an update, check against (existing_cart_quantity + new_quantity_to_add)
            // This needs more nuanced logic if updating quantity vs. adding new
            return res.status(400).send({ message: `Not enough stock for Product ID ${product_id}. Available: ${product.stock_quantity}` });
        }

        let cartItem = await CartItem.findOne({ where: { user_id: userId, product_id: product_id } });

        if (cartItem) {
            // Item exists, update quantity (ensure new total quantity doesn't exceed stock)
            const newQuantity = cartItem.quantity + parseInt(quantity);
            if (product.stock_quantity < newQuantity) {
                return res.status(400).send({ message: `Cannot add ${quantity} more. Total quantity would exceed stock for Product ID ${product_id}. Available: ${product.stock_quantity}, In Cart: ${cartItem.quantity}` });
            }
            cartItem.quantity = newQuantity;
            // Optionally update price_at_addition if logic dictates, but usually it's fixed when first added.
            await cartItem.save();
            res.send(cartItem);
        } else {
            // Item does not exist, create new cart item
            const newItem = {
                user_id: userId,
                product_id: product_id,
                quantity: parseInt(quantity),
                price_at_addition: price_at_addition, // This price should be calculated based on product.base_price + dynamic gold price at time of addition
                gold_price_snapshot_id: gold_price_snapshot_id || null,
            };
            const data = await CartItem.create(newItem);
            res.send(data);
        }
    } catch (err) {
        res.status(500).send({ message: err.message || "Error adding item to cart." });
    }
};

// Get all items in the user's cart
exports.getCart = async (req, res) => {
    const userId = req.user.id; // Placeholder
    try {
        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['product_id', 'name', 'slug', 'base_price', 'karat', 'weight_grams'] // Add other needed product details
                    // Potentially include ProductImages here as well for cart display
                },
                { model: GoldPrice, as: 'GoldPrice' } // If using gold_price_snapshot_id
            ],
            order: [['added_at', 'ASC']]
        });
        // Calculate total cart price here if needed, potentially considering current gold prices for display vs. fixed price_at_addition
        res.send(cartItems);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error retrieving cart." });
    }
};

// Update quantity of a specific item in the cart
exports.updateItemQuantity = async (req, res) => {
    const userId = req.user.id; // Placeholder
    const productIdToUpdate = req.params.productId;
    const { quantity } = req.body;

    if (quantity === undefined || parseInt(quantity) <= 0) {
        return res.status(400).send({ message: "A positive quantity is required." });
    }

    try {
        const cartItem = await CartItem.findOne({ where: { user_id: userId, product_id: productIdToUpdate } });
        if (!cartItem) {
            return res.status(404).send({ message: "Item not found in cart." });
        }

        const product = await Product.findByPk(productIdToUpdate);
        if (!product) return res.status(404).send({ message: `Product with id=${productIdToUpdate} not found.` });
        if (product.stock_quantity < quantity) {
            return res.status(400).send({ message: `Not enough stock for Product ID ${productIdToUpdate}. Available: ${product.stock_quantity}` });
        }

        cartItem.quantity = parseInt(quantity);
        // Price_at_addition usually stays the same as when it was first added.
        await cartItem.save();
        res.send(cartItem);
    } catch (err) {
        res.status(500).send({ message: err.message || "Error updating item quantity." });
    }
};

// Remove an item from the cart
exports.removeItem = async (req, res) => {
    const userId = req.user.id; // Placeholder
    const productIdToRemove = req.params.productId;

    try {
        const num = await CartItem.destroy({ where: { user_id: userId, product_id: productIdToRemove } });
        if (num == 1) {
            res.send({ message: "Item removed from cart successfully." });
        } else {
            res.status(404).send({ message: "Item not found in cart or could not be removed." });
        }
    } catch (err) {
        res.status(500).send({ message: err.message || "Error removing item from cart." });
    }
};

// Clear the entire cart for the user
exports.clearCart = async (req, res) => {
    const userId = req.user.id; // Placeholder
    try {
        await CartItem.destroy({ where: { user_id: userId } });
        res.send({ message: "Cart cleared successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message || "Error clearing cart." });
    }
}; 