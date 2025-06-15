const express = require('express');
const db = require('./models'); // This will pick up models/index.js
const cors = require('cors'); // Import cors
const path = require('path'); // Import path

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Use cors middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'frontend/public/uploads')));

// A simple route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Jewelry Site API!' });
});

// Import and use routes here
require("./routes/user.routes")(app);
require("./routes/category.routes")(app);
require("./routes/product.routes")(app);
require("./routes/productImage.routes")(app); // Handles /api/products/:productId/images
require("./routes/goldPrice.routes")(app);
require("./routes/cartItem.routes")(app); // Handles /api/cart
require("./routes/order.routes")(app);
require("./routes/orderItem.routes")(app); // Handles /api/orders/:orderId/items
require("./routes/payment.routes")(app); // Handles /api/orders/:orderId/payments
require("./routes/contactInquiry.routes")(app);
require("./routes/siteContent.routes")(app);
require("./routes/socialMediaLink.routes")(app);
require("./routes/address.routes")(app);
require("./routes/admin.routes")(app);
// ... and so on for other routes

// Sync database
// In development, you might use { force: true } to drop and recreate tables on every start.
// Be cautious with this in production.
db.sequelize.sync() // Changed from { alter: true } to avoid "Too many keys" error
    .then(() => {
        console.log('Database synced successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });

module.exports = app; // Export for potential testing