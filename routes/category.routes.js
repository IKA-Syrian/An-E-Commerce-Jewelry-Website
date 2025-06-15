module.exports = app => {
    const categories = require("../controllers/category.controller.js");
    var router = require("express").Router();
    const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth'); // Import auth middleware

    // Public routes - anyone can access
    // Retrieve all Categories
    router.get("/", categories.findAll);

    // Retrieve a single Category with id
    router.get("/:id", categories.findOne);

    // Admin-only routes
    // Create a new Category (admin only)
    router.post("/", adminAuthMiddleware, categories.create);

    // Update a Category with id (admin only)
    router.put("/:id", adminAuthMiddleware, categories.update);

    // Delete a Category with id (admin only)
    router.delete("/:id", adminAuthMiddleware, categories.delete);

    // Base path for category routes
    app.use('/api/categories', router);
}; 