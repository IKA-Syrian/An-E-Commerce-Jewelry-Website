module.exports = app => {
    const admin = require("../controllers/admin.controller.js");
    const { authMiddleware, adminMiddleware } = require("../middleware/auth");
    var router = require("express").Router();

    // Apply admin middleware to all routes
    router.use(authMiddleware, adminMiddleware);

    // Get dashboard statistics
    router.get("/dashboard/stats", admin.getDashboardStats);

    // Base path for admin routes
    app.use('/api/admin', router);
}; 