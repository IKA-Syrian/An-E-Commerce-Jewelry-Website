const db = require("../models");
const GoldPrice = db.GoldPrice;
const { Op } = require("sequelize");

// Create and Save a new GoldPrice (admin or system action)
exports.create = async (req, res) => {
    if (!req.body.price_per_gram_24k || !req.body.timestamp) {
        res.status(400).send({
            message: "Price per gram (24k) and timestamp are required!"
        });
        return;
    }

    const goldPrice = {
        price_per_gram_24k: req.body.price_per_gram_24k,
        timestamp: req.body.timestamp, // Expecting ISO 8601 format string e.g. "2023-10-27T10:00:00Z"
        source_api: req.body.source_api || null,
    };

    try {
        const data = await GoldPrice.create(goldPrice);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the GoldPrice entry."
        });
    }
};

// Retrieve all GoldPrice entries from the database.
exports.findAll = async (req, res) => {
    // Consider pagination and filtering by date range
    try {
        const data = await GoldPrice.findAll({
            order: [['timestamp', 'DESC']]
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving gold prices."
        });
    }
};

// Find a single GoldPrice with an id
exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const data = await GoldPrice.findByPk(id);
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({ message: `Cannot find GoldPrice with id=${id}.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error retrieving GoldPrice with id=" + id });
    }
};

// Find the latest GoldPrice entry
exports.findLatest = async (req, res) => {
    try {
        const data = await GoldPrice.findOne({
            order: [['timestamp', 'DESC']]
        });
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({ message: "No gold price data found." });
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving the latest gold price."
        });
    }
};

// Update and Delete are usually not applicable for historical price logs.
// If needed, they would be admin-only operations. 