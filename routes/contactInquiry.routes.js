module.exports = app => {
    const contactInquiries = require("../controllers/contactInquiry.controller.js");
    const { authMiddleware, adminAuthMiddleware } = require("../middleware/auth");
    var router = require("express").Router();

    // Create a new Contact Inquiry - public endpoint
    router.post("/", contactInquiries.create);

    // Retrieve all Contact Inquiries - admin only
    router.get("/", adminAuthMiddleware, contactInquiries.findAll);

    // Retrieve a single Contact Inquiry with id - admin only
    router.get("/:id", adminAuthMiddleware, contactInquiries.findOne);

    // Update a Contact Inquiry with id - admin only
    router.put("/:id", adminAuthMiddleware, contactInquiries.update);

    // Mark a Contact Inquiry as resolved - admin only
    router.put("/:id/resolve", adminAuthMiddleware, contactInquiries.resolve);

    // Delete a Contact Inquiry with id - admin only
    router.delete("/:id", adminAuthMiddleware, contactInquiries.delete);

    // Base path for contact inquiry routes
    app.use('/api/contact-inquiries', router);
}; 