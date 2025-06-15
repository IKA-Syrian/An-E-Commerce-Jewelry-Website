module.exports = app => {
    const socialMediaLinks = require("../controllers/socialMediaLink.controller.js");
    const { authMiddleware, adminAuthMiddleware } = require("../middleware/auth");
    var router = require("express").Router();

    // Create a new Social Media Link - admin only
    router.post("/", adminAuthMiddleware, socialMediaLinks.create);

    // Retrieve all Social Media Links - public endpoint
    router.get("/", socialMediaLinks.findAll);

    // Retrieve a single Social Media Link with id - admin only
    router.get("/:id", adminAuthMiddleware, socialMediaLinks.findOne);

    // Update a Social Media Link with id - admin only
    router.put("/:id", adminAuthMiddleware, socialMediaLinks.update);

    // Delete a Social Media Link with id - admin only
    router.delete("/:id", adminAuthMiddleware, socialMediaLinks.delete);

    // Update the order of multiple Social Media Links - admin only
    router.post("/update-order", adminAuthMiddleware, socialMediaLinks.updateOrder);

    // Toggle active status of a Social Media Link - admin only
    router.put("/:id/toggle-active", adminAuthMiddleware, socialMediaLinks.toggleActive);

    // Base path for social media link routes
    app.use('/api/social-media-links', router);
}; 