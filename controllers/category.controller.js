const db = require("../models");
const Category = db.Category;

// Create and Save a new Category
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.slug) {
        res.status(400).send({
            message: "Name and slug are required!"
        });
        return;
    }

    // Create a Category object
    const category = {
        name: req.body.name,
        description: req.body.description || null,
        slug: req.body.slug,
    };

    // Save Category in the database
    try {
        const data = await Category.create(category);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Category."
        });
    }
};

// Retrieve all Categories from the database.
exports.findAll = async (req, res) => {
    // Extract query parameters for filtering, pagination, sorting
    const { 
        search, 
        sort_by, 
        sort_direction,
        page,
        limit
    } = req.query;
    
    // Build the WHERE condition
    let condition = {};
    
    // Search in name or description
    if (search) {
        const { Op } = require("sequelize"); // Import operator only when needed
        condition[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }

    try {
        // First, get the total count
        const count = await Category.count({ where: condition });
        
        // Build query options for the actual data
        const options = {
            where: condition
        };

        // Add sorting if specified
        if (sort_by) {
            options.order = [
                [sort_by, sort_direction === 'DESC' ? 'DESC' : 'ASC']
            ];
        } else {
            // Default sort by name ascending
            options.order = [['name', 'ASC']];
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
        
        // Get the categories with pagination
        const categories = await Category.findAll(options);
        
        // Determine if we should use the old or new response format
        // For backward compatibility, use the old format (just the array) if no pagination parameters are used
        const isPaginationRequest = page !== undefined || limit !== undefined;
        
        if (isPaginationRequest) {
            // Return both the categories and pagination metadata
            res.send({
                totalItems: count,
                categories: categories,
                currentPage: page ? parseInt(page) : 1,
                totalPages: limit ? Math.ceil(count / parseInt(limit)) : 1
            });
        } else {
            // For backward compatibility, return just the categories array
            res.send(categories);
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving categories."
        });
    }
};

// Find a single Category with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const data = await Category.findByPk(id);
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({
                message: `Cannot find Category with id=${id}.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving Category with id=" + id
        });
    }
};

// Update a Category by the id in the request
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await Category.update(req.body, {
            where: { category_id: id }
        });
        if (num == 1) {
            res.send({
                message: "Category was updated successfully."
            });
        } else {
            res.send({
                message: `Cannot update Category with id=${id}. Maybe Category was not found or req.body is empty!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Category with id=" + id
        });
    }
};

// Delete a Category with the specified id in the request
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await Category.destroy({
            where: { category_id: id }
        });
        if (num == 1) {
            res.send({
                message: "Category was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete Category with id=${id}. Maybe Category was not found!`
            });
        }
    } catch (err) {
        // Consider ON DELETE SET NULL constraint on Products.category_id
        // If products are associated, direct deletion might be restricted by DB if not handled by Sequelize onDelete or if products exist.
        res.status(500).send({
            message: "Could not delete Category with id=" + id + ". It might be in use or an error occurred."
        });
    }
}; 