module.exports = app => {
    const addresses = require("../controllers/address.controller.js"); // Controller will be created later
    const router = require("express").Router();
    const { authMiddleware } = require('../middleware/auth'); // Import auth middleware

    // Create a new Address for the authenticated user
    router.post("/", authMiddleware, addresses.create);

    // Retrieve all Addresses for the authenticated user
    router.get("/", authMiddleware, addresses.findAllForUser);

    // Retrieve a single Address with id (belonging to the authenticated user)
    router.get("/:id", authMiddleware, addresses.findOneForUser);

    // Update an Address with id (belonging to the authenticated user)
    router.put("/:id", authMiddleware, addresses.updateForUser);

    // Delete an Address with id (belonging to the authenticated user)
    router.delete("/:id", authMiddleware, addresses.deleteForUser);

    // Route to set a default address
    router.put("/:id/set-default", authMiddleware, addresses.setDefault);

    app.use('/api/addresses', router); // User-specific address management
}; 