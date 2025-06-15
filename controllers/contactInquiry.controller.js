const db = require("../models");
const ContactInquiry = db.ContactInquiry;
const { Op } = require("sequelize");

// Create and Save a new Contact Inquiry
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.email || !req.body.message) {
        return res.status(400).send({
            message: "Name, email, and message are required!"
        });
    }

    // Create a ContactInquiry object
    const contactInquiry = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject || null,
        message: req.body.message,
        received_at: new Date(),
        is_resolved: false,
        resolved_at: null,
        notes: null
    };

    try {
        // Save ContactInquiry in the database
        const data = await ContactInquiry.create(contactInquiry);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Contact Inquiry."
        });
    }
};

// Retrieve all Contact Inquiries from the database
exports.findAll = async (req, res) => {
    const { 
        search, 
        status,
        sort_by = 'received_at', 
        sort_direction = 'DESC',
        page,
        limit
    } = req.query;
    
    // Build the WHERE condition
    let condition = {};
    
    // Filter by status if provided
    if (status === 'resolved') {
        condition.is_resolved = true;
    } else if (status === 'unresolved') {
        condition.is_resolved = false;
    }
    
    // Search in name, email, subject, or message
    if (search) {
        condition[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { subject: { [Op.like]: `%${search}%` } },
            { message: { [Op.like]: `%${search}%` } }
        ];
    }
    
    try {
        // First, get the total count
        const count = await ContactInquiry.count({
            where: condition
        });
        
        // Build query options for the actual data
        const options = {
            where: condition
        };
        
        // Add sorting if specified
        if (sort_by) {
            options.order = [
                [sort_by, sort_direction === 'DESC' ? 'DESC' : 'ASC']
            ];
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
        
        const inquiries = await ContactInquiry.findAll(options);
        
        // Return both the inquiries and pagination metadata
        res.send({
            totalItems: count,
            inquiries: inquiries,
            currentPage: page ? parseInt(page) : 1,
            totalPages: limit ? Math.ceil(count / parseInt(limit)) : 1
        });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving inquiries."
        });
    }
};

// Find a single Contact Inquiry with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const inquiry = await ContactInquiry.findByPk(id);
        if (inquiry) {
            res.send(inquiry);
        } else {
            res.status(404).send({
                message: `Contact Inquiry with id=${id} not found.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving Contact Inquiry with id=" + id
        });
    }
};

// Update a Contact Inquiry by the id
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        // Find the inquiry first to check if it exists
        const inquiry = await ContactInquiry.findByPk(id);
        
        if (!inquiry) {
            return res.status(404).send({
                message: `Contact Inquiry with id=${id} not found.`
            });
        }
        
        // Create update object with only allowed fields
        const updateData = {};
        
        if (req.body.notes !== undefined) {
            updateData.notes = req.body.notes;
        }
        
        // If is_resolved is being updated
        if (req.body.is_resolved !== undefined) {
            updateData.is_resolved = req.body.is_resolved;
            
            // Update resolved_at timestamp when resolving
            if (req.body.is_resolved === true && !inquiry.is_resolved) {
                updateData.resolved_at = new Date();
            } else if (req.body.is_resolved === false) {
                updateData.resolved_at = null;
            }
        }
        
        const [num] = await ContactInquiry.update(updateData, {
            where: { inquiry_id: id }
        });

        if (num === 1) {
            // Get the updated inquiry
            const updatedInquiry = await ContactInquiry.findByPk(id);
            res.send(updatedInquiry);
        } else {
            res.status(500).send({
                message: `Error updating Contact Inquiry with id=${id}.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error updating Contact Inquiry with id=" + id
        });
    }
};

// Mark a Contact Inquiry as resolved
exports.resolve = async (req, res) => {
    const id = req.params.id;
    
    try {
        const [num] = await ContactInquiry.update(
            { 
                is_resolved: true,
                resolved_at: new Date(),
                notes: req.body.notes || null
            }, 
            { where: { inquiry_id: id } }
        );

        if (num === 1) {
            // Get the updated inquiry
            const updatedInquiry = await ContactInquiry.findByPk(id);
            res.send(updatedInquiry);
        } else {
            res.status(404).send({
                message: `Cannot resolve Contact Inquiry with id=${id}. Maybe it was not found.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error resolving Contact Inquiry with id=" + id
        });
    }
};

// Delete a Contact Inquiry with the specified id
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const num = await ContactInquiry.destroy({
            where: { inquiry_id: id }
        });

        if (num === 1) {
            res.send({
                message: "Contact Inquiry was deleted successfully!"
            });
        } else {
            res.status(404).send({
                message: `Cannot delete Contact Inquiry with id=${id}. Maybe it was not found.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete Contact Inquiry with id=" + id
        });
    }
}; 