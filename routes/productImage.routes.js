module.exports = app => {
    const productImages = require("../controllers/productImage.controller.js"); // Controller will be created later
    var router = require("express").Router({ mergeParams: true }); // mergeParams allows access to :productId
    const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth'); // Import auth middleware
    const uploadMiddleware = require('../middleware/upload'); // Import file upload middleware

    // Public route - anyone can access
    // Retrieve all ProductImages for a Product
    // GET /api/products/:productId/images
    router.get("/", productImages.findAllByProduct);

    // Retrieve a single ProductImage with id
    // GET /api/products/:productId/images/:imageId
    router.get("/:imageId", productImages.findOne);

    // Admin-only routes
    // Create a new ProductImage for a Product (admin only)
    // POST /api/products/:productId/images
    router.post("/", 
        adminAuthMiddleware, 
        uploadMiddleware.productImage,
        uploadMiddleware.handleMulterError,
        productImages.create
    );

    // Update a ProductImage with id (admin only)
    // PUT /api/products/:productId/images/:imageId
    router.put("/:imageId", adminAuthMiddleware, productImages.update);

    // Delete a ProductImage with id (admin only)
    // DELETE /api/products/:productId/images/:imageId
    router.delete("/:imageId", adminAuthMiddleware, productImages.delete);

    // Mount on a specific path that includes productId
    // This will be used in app.js slightly differently or by another route file.
    // For now, let's assume a base path and handle nesting in app.js or product.routes.js
    app.use('/api/products/:productId/images', router);
}; 