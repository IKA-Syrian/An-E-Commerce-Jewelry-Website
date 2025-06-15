module.exports = app => {
    const siteContent = require("../controllers/siteContent.controller.js");
    const { authMiddleware, adminAuthMiddleware } = require("../middleware/auth");
    var router = require("express").Router();

    // Retrieve all site content - accessible to anyone
    router.get("/", siteContent.findAll);

    // Retrieve specific site content by key - accessible to anyone
    router.get("/:key", siteContent.findByKey);

    // Create new site content - admin only
    router.post("/", adminAuthMiddleware, siteContent.create);

    // Update site content by key - admin only
    router.put("/:key", adminAuthMiddleware, siteContent.update);

    // Delete site content by key - admin only
    router.delete("/:key", adminAuthMiddleware, siteContent.delete);

    // Base path for site content routes
    app.use('/api/site-content', router);
}; 