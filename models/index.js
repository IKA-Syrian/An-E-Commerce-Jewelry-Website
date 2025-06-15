const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Initialize Sequelize (replace with your actual database connection details)
// It's good practice to use environment variables for sensitive data.
const sequelize = new Sequelize(process.env.DB_NAME || 'your_database_name', process.env.DB_USER || 'your_username', process.env.DB_PASSWORD || 'your_password', {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql', // or 'postgres', 'sqlite', 'mssql'
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log queries in development
});

const db = {};

// Read all files in the current directory (models)
fs
    .readdirSync(__dirname)
    .filter(file => {
        // Filter out non-JS files, the current index.js file, and test files
        return (file.indexOf('.') !== 0) && (file !== path.basename(__filename)) && (file.slice(-3) === '.js') && (file.indexOf('.test.js') === -1);
    })
    .forEach(file => {
        // Import each model file
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

// Apply associations if they exist
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize; // The Sequelize instance
db.Sequelize = Sequelize;   // The Sequelize library

module.exports = db;

// Test the connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

if (process.env.NODE_ENV !== 'test') { // Don't run testConnection during tests
    testConnection();
} 