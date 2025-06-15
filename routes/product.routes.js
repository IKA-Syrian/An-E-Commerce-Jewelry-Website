module.exports = app => {
    const products = require("../controllers/product.controller.js"); // Controller will be created later
    var router = require("express").Router();
    const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth'); // Import auth middleware

    // Public routes - anyone can access
    // Retrieve all Products (with filtering)
    router.get("/", products.findAll);

    // Retrieve a single Product with id
    router.get("/:id", products.findOne);

    // Admin-only routes
    // Create a new Product (admin only)
    router.post("/", adminAuthMiddleware, products.create);

    // Update a Product with id (admin only)
    router.put("/:id", adminAuthMiddleware, products.update);

    // Delete a Product with id (admin only)
    router.delete("/:id", adminAuthMiddleware, products.delete);

    // TODO: Add routes for products by category, etc.

    app.use('/api/products', router);
}; 