module.exports = app => {
    const goldPrices = require("../controllers/goldPrice.controller.js"); // Controller will be created later
    var router = require("express").Router();

    // Create a new GoldPrice entry (likely admin or system action)
    router.post("/", goldPrices.create);

    // Retrieve all GoldPrice entries (possibly with pagination/filters)
    router.get("/", goldPrices.findAll);

    // Retrieve a single GoldPrice with id
    router.get("/:id", goldPrices.findOne);

    // Get the latest GoldPrice (a common use case)
    router.get("/latest/current", goldPrices.findLatest); // Custom route

    // Potentially, no update/delete for historical price logs, or only admin
    // router.put("/:id", goldPrices.update); // If updates are allowed
    // router.delete("/:id", goldPrices.delete); // If deletions are allowed

    app.use('/api/goldprices', router);
}; 