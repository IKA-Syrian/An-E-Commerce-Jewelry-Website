const db = require("../models");
const Product = db.Product;
const Category = db.Category; // For potential eager loading
const ProductImage = db.ProductImage; // For potential eager loading
const { Op } = require("sequelize"); // For more complex queries if needed

// Create and Save a new Product
exports.create = async (req, res) => {
    // Validate request (basic validation)
    if (!req.body.name || !req.body.description || !req.body.slug || req.body.base_price === undefined) {
        res.status(400).send({
            message: "Name, description, slug, and base_price are required!"
        });
        return;
    }

    const product = {
        name: req.body.name,
        description: req.body.description,
        slug: req.body.slug,
        category_id: req.body.category_id || null,
        sku: req.body.sku || null,
        base_price: req.body.base_price,
        weight_grams: req.body.weight_grams || null,
        karat: req.body.karat || null,
        stock_quantity: req.body.stock_quantity === undefined ? 0 : req.body.stock_quantity,
        is_active: req.body.is_active === undefined ? true : req.body.is_active,
        is_featured: req.body.is_featured === undefined ? false : req.body.is_featured
    };

    try {
        const data = await Product.create(product);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Product."
        });
    }
};

// Retrieve all Products from the database.
exports.findAll = async (req, res) => {
    // Enhanced query parameters for filtering, pagination, sorting
    const { 
        categoryId, 
        isActive, 
        search, 
        featured, 
        sort_by, 
        sort_direction,
        page,
        limit
    } = req.query;
    
    // Build the WHERE condition
    let condition = {};
    
    // Apply filters
    if (categoryId) condition.category_id = categoryId;
    if (isActive !== undefined) condition.is_active = isActive === 'true';
    if (featured !== undefined) condition.is_featured = featured === 'true';
    
    // Search in name, description, or SKU
    if (search) {
        condition[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
            { sku: { [Op.like]: `%${search}%` } }
        ];
    }

    try {
        // First, get the total count
        const count = await Product.count({ where: condition });
        
        // Build query options for the actual data
        const options = {
            where: condition,
            include: [
                { model: Category, as: 'Category' }, 
                { model: ProductImage, as: 'ProductImages' }
            ]
        };

        // Add sorting if specified
        if (sort_by) {
            options.order = [
                [sort_by, sort_direction === 'DESC' ? 'DESC' : 'ASC']
            ];
        } else {
            // Default sort by id descending (newest first)
            options.order = [['product_id', 'DESC']];
        }

        // Add pagination if both page and limit are specified
        if (page !== undefined && limit !== undefined) {
            const pageNumber = parseInt(page);
            const pageSize = parseInt(limit);
            options.offset = (pageNumber - 1) * pageSize;
            options.limit = pageSize;
        } else if (limit !== undefined) {
            // Just limit the results if only limit is specified
            options.limit = parseInt(limit);
        }

        // Get the products with pagination
        const products = await Product.findAll(options);
        
        // Determine if we should use the old or new response format
        // For backward compatibility, use the old format (just the array) if no pagination parameters are used
        const isPaginationRequest = page !== undefined || limit !== undefined;
        
        if (isPaginationRequest) {
            // Return both the products and pagination metadata
            res.send({
                totalItems: count,
                products: products,
                currentPage: page ? parseInt(page) : 1,
                totalPages: limit ? Math.ceil(count / parseInt(limit)) : 1
            });
        } else {
            // For backward compatibility, return just the products array
            res.send(products);
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving products."
        });
    }
};

// Find a single Product with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'Category' },
                { model: ProductImage, as: 'ProductImages' }
            ]
        });
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({
                message: `Cannot find Product with id=${id}.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving Product with id=" + id
        });
    }
};

// Update a Product by the id in the request
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await Product.update(req.body, {
            where: { product_id: id }
        });
        if (num == 1) {
            res.send({
                message: "Product was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Product with id=" + id
        });
    }
};

// Delete a Product with the specified id in the request
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        // Check if the product exists first
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).send({
                message: `Product with id=${id} not found.`
            });
        }

        // Check if the product is used in any orders
        const OrderItem = db.OrderItem;
        const orderItemCount = await OrderItem.count({
            where: { product_id: id }
        });

        if (orderItemCount > 0) {
            // Product is used in orders, return a more specific error
            return res.status(400).send({
                message: `Cannot delete Product with id=${id} because it's used in ${orderItemCount} orders. Consider deactivating it instead.`,
                inUse: true,
                orderCount: orderItemCount
            });
        }

        // Safe to delete
        const num = await Product.destroy({
            where: { product_id: id }
        });
        
        if (num == 1) {
            res.send({
                message: "Product was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Product with id=${id}. Maybe Product was not found!`
            });
        }
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).send({
            message: "Could not delete Product with id=" + id + ". An error occurred: " + err.message
        });
    }
}; 