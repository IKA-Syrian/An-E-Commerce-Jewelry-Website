# JewelrySite 💎

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-Frontend-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-API-lightgrey.svg)](https://expressjs.com/)

A full-stack jewelry e-commerce platform built with modern technologies.

## ✨ Features

-   **User Authentication** - Register, login, and user profiles
-   **Product Catalog** - Browse categories and products
-   **Shopping Cart** - Add items, update quantities, checkout
-   **Admin Dashboard** - Manage products, categories, and orders
-   **Responsive Design** - Web and mobile-friendly interface
-   **Mobile App** - React Native WebView wrapper for native experience

## 🛠️ Technologies

### Backend

-   **Node.js** & **Express** - API server
-   **Sequelize** - ORM for database management
-   **SQLite/MySQL/Postgres** - Database options

### Frontend

-   **React** - UI library
-   **Vite** - Build tool
-   **TailwindCSS** - Utility-first CSS
-   **React Query** - Data fetching
-   **React Router** - Navigation

### Mobile

-   **React Native** with **Expo** - Mobile wrapper

## 📁 Project Structure

```
JewelySite/
├── app.js                # Backend entry (Express API)
├── controllers/          # Backend controllers
├── models/               # Sequelize models
├── routes/               # API route definitions
├── frontend/             # React frontend (Vite)
├── mobile/               # React Native (Expo) WebView app
├── code.sql              # Example SQL schema
├── package.json          # Backend dependencies
└── ...
```

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18+ recommended)
-   **npm** or **bun** package manager
-   **Expo CLI** (for mobile app): `npm install -g expo-cli`
-   **Android/iOS device** or emulator (for mobile testing)

### Backend Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/JewelrySite.git
    cd JewelrySite
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    bun install
    ```

3. Create a `.env` file based on `.env.example`

4. Start the backend server:

    ```bash
    node app.js
    # or
    bun run app.js
    ```

    The API will run on `http://localhost:3000` by default.

### Frontend Setup

1. Navigate to the frontend directory:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    bun install
    ```

3. Start the development server:

    ```bash
    npm run dev
    # or
    bun run dev
    ```

    The app will run on `http://localhost:8080` by default.

### Mobile App Setup

1. Navigate to the mobile directory:

    ```bash
    cd mobile
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Update the WebView URL in `App.js` to point to your frontend's LAN IP:

    ```javascript
    // Example: const uri = 'http://192.168.1.10:8080';
    ```

4. Start the Expo development server:

    ```bash
    npx expo start
    ```

5. Scan the QR code with the Expo Go app on your device (must be on same WiFi network)

## 📊 Sample Data

To populate the database with sample data:

1. Configure your database connection in `.env` or `models/index.js`

2. Run the seed script:
    ```bash
    npm run seed
    # or for essential models only:
    npm run seed:simple
    ```

The seed script will create:

-   Admin user (email: admin@example.com, password: password123)
-   Categories (Rings, Necklaces, Bracelets, Earrings, Watches)
-   Sample products with images

3. Verify the API is working:
    ```bash
    node testApi.js
    ```

## 💡 Development Notes

-   For local mobile testing, ensure your device and computer are on the same WiFi network
-   Use your computer's LAN IP in the WebView URL
-   For production deployment, update the WebView URL to your hosted frontend

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Ibrahim Al Shalabi - IKA-Syrian](https://github.com/IKA-Syrian)
