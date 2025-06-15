const db = require("../models");
const SiteContent = db.SiteContent;
const User = db.User; // For last_updated_by
const { Op } = require("sequelize");

// Retrieve all site content
exports.findAll = async (req, res) => {
    try {
        const siteContent = await SiteContent.findAll({
            include: [
                {
                    model: db.User,
                    as: 'LastUpdatedByAdmin',
                    attributes: ['user_id', 'first_name', 'last_name']
                }
            ],
            order: [['content_key', 'ASC']]
        });
        
        res.send(siteContent);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving site content."
        });
    }
};

// Find a single site content by key
exports.findByKey = async (req, res) => {
    const key = req.params.key;
    
    try {
        const content = await SiteContent.findOne({
            where: { content_key: key },
            include: [
                {
                    model: db.User,
                    as: 'LastUpdatedByAdmin',
                    attributes: ['user_id', 'first_name', 'last_name']
                }
            ]
        });
        
        if (content) {
            res.send(content);
        } else {
            res.status(404).send({
                message: `Site content with key=${key} not found.`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving content with key=" + key
        });
    }
};

// Create new site content
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.content_key || !req.body.content_value) {
        return res.status(400).send({
            message: "Content key and value are required!"
        });
    }

    // Create a SiteContent object
    const siteContent = {
        content_key: req.body.content_key,
        title: req.body.title || null,
        content_value: req.body.content_value,
        last_updated_by: req.user.id // From auth middleware
    };

    try {
        // Check if content with this key already exists
        const existingContent = await SiteContent.findOne({
            where: { content_key: req.body.content_key }
        });
        
        if (existingContent) {
            return res.status(400).send({
                message: `Content with key=${req.body.content_key} already exists. Use PUT to update it.`
            });
        }
        
        // Save SiteContent in the database
        const data = await SiteContent.create(siteContent);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error creating site content."
        });
    }
};

// Update site content
exports.update = async (req, res) => {
    const key = req.params.key;
    
    // Validate request
    if (!req.body.content_value) {
        return res.status(400).send({
            message: "Content value is required!"
        });
    }
    
    try {
        // Find content by key
        const content = await SiteContent.findOne({
            where: { content_key: key }
        });
        
        if (!content) {
            return res.status(404).send({
                message: `Site content with key=${key} not found.`
            });
        }
        
        // Update content
        const updateData = {
            title: req.body.title !== undefined ? req.body.title : content.title,
            content_value: req.body.content_value,
            last_updated_by: req.user.id // From auth middleware
        };
        
        await SiteContent.update(updateData, {
            where: { content_key: key }
        });
        
        // Get updated content
        const updatedContent = await SiteContent.findOne({
            where: { content_key: key },
            include: [
                {
                    model: db.User,
                    as: 'LastUpdatedByAdmin',
                    attributes: ['user_id', 'first_name', 'last_name']
                }
            ]
        });
        
        res.send(updatedContent);
    } catch (err) {
        res.status(500).send({
            message: "Error updating content with key=" + key
        });
    }
};

// Delete site content
exports.delete = async (req, res) => {
    const key = req.params.key;
    
    try {
        const result = await SiteContent.destroy({
            where: { content_key: key }
        });
        
        if (result === 1) {
            res.send({
                message: "Site content was deleted successfully!"
            });
        } else {
            res.send({
                message: `Cannot delete site content with key=${key}. Maybe it was not found!`
            });
        }
    } catch (err) {
        res.status(500).send({
            message: "Could not delete site content with key=" + key
        });
    }
}; 