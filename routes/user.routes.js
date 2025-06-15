module.exports = app => {
    const users = require("../controllers/user.controller.js");
    const { authMiddleware, adminAuthMiddleware } = require("../middleware/auth");
    var router = require("express").Router();

    // Create a new User (register)
    router.post("/", users.create);

    // Retrieve all Users (admin only)
    router.get("/", adminAuthMiddleware, users.findAll);

    // Retrieve a single User with id (requires auth)
    router.get("/:id", authMiddleware, users.findOne);

    // Update a User with id (requires auth)
    router.put("/:id", authMiddleware, users.update);

    // Delete a User with id (requires auth)
    router.delete("/:id", authMiddleware, users.delete);

    // Update user role (admin/user) - admin only
    router.put("/:id/role", adminAuthMiddleware, users.updateRole);
    
    // Get user order summary - admin only
    router.get("/:id/order-summary", adminAuthMiddleware, users.getOrderSummary);

    // Add login route
    router.post('/login', users.login);

    // Admin login route
    router.post('/admin/login', users.adminLogin);

    // Get current user profile
    router.get("/profile/me", authMiddleware, users.getCurrentProfile);

    // Base path for user routes
    app.use('/api/users', router);
}; 