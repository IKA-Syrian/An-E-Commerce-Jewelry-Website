const db = require("../models");
const ProductImage = db.ProductImage;
const Product = db.Product;
const path = require('path');
const fs = require('fs');

// Create and Save a new ProductImage for a specific Product
// This controller works with multer middleware to handle file uploads
exports.create = async (req, res) => {
    const productId = req.params.productId;

    try {
        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            // If file was uploaded, delete it
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).send({ message: `Product with id=${productId} not found.` });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).send({ message: "No image file provided!" });
        }

        // Generate image URL (relative to server)
        const imageUrl = `/uploads/products/${path.basename(req.file.path)}`;

        const productImage = {
            product_id: productId,
            image_url: imageUrl,
            alt_text: req.body.alt_text || product.name, // Default to product name if not provided
            is_primary: req.body.is_primary === 'true', // Convert string to boolean
            display_order: req.body.display_order || 0,
        };

        const data = await ProductImage.create(productImage);
        res.send(data);
    } catch (err) {
        // If file was uploaded, delete it on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).send({
            message: err.message || "Some error occurred while creating the ProductImage."
        });
    }
};

// Retrieve all ProductImages for a specific Product.
exports.findAllByProduct = async (req, res) => {
    const productId = req.params.productId;
    try {
        const data = await ProductImage.findAll({
            where: { product_id: productId },
            order: [['display_order', 'ASC'], ['created_at', 'ASC']]
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving product images."
        });
    }
};

// Find a single ProductImage with an id
exports.findOne = async (req, res) => {
    const imageId = req.params.imageId;
    // const productId = req.params.productId; // Also available if needed for context

    try {
        const data = await ProductImage.findByPk(imageId);
        if (data) {
            // Optional: check if data.product_id matches productId from route if strict context is needed
            res.send(data);
        } else {
            res.status(404).send({ message: `Cannot find ProductImage with id=${imageId}.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error retrieving ProductImage with id=" + imageId });
    }
};

// Update a ProductImage by the id in the request
exports.update = async (req, res) => {
    const imageId = req.params.imageId;
    // const productId = req.params.productId; // For context

    try {
        // Ensure the update doesn't change the product_id if that's not allowed
        const updateData = { ...req.body };
        delete updateData.product_id; // Prevent changing the associated product

        const num = await ProductImage.update(updateData, { where: { image_id: imageId, product_id: req.params.productId } });
        if (num == 1) {
            res.send({ message: "ProductImage was updated successfully." });
        } else {
            res.send({ message: `Cannot update ProductImage with id=${imageId}. Maybe it was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error updating ProductImage with id=" + imageId });
    }
};

// Delete a ProductImage with the specified id in the request
exports.delete = async (req, res) => {
    const imageId = req.params.imageId;

    try {
        // Find the image first to get the image_url for file deletion
        const image = await ProductImage.findOne({ 
            where: { 
                image_id: imageId, 
                product_id: req.params.productId 
            } 
        });

        if (!image) {
            return res.status(404).send({ 
                message: `ProductImage with id=${imageId} not found.` 
            });
        }

        // Delete the image record from database
        const num = await ProductImage.destroy({ 
            where: { 
                image_id: imageId, 
                product_id: req.params.productId 
            } 
        });

        if (num == 1) {
            // Try to delete the physical file if it exists
            try {
                // Extract the file path from the stored URL
                const filePath = path.join(__dirname, '..', image.image_url);
                
                // Check if file exists before attempting to delete
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (fileErr) {
                console.error('Error deleting image file:', fileErr);
                // Continue with success response even if file deletion fails
            }

            res.send({ message: "ProductImage was deleted successfully!" });
        } else {
            res.send({ message: `Cannot delete ProductImage with id=${imageId}.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Could not delete ProductImage with id=" + imageId });
    }
}; 