const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const db = require('../models');

// Models
const { User, Category, Product, ProductImage } = db;

// Generate a random SKU
const generateSKU = () => {
  return `JW-${faker.string.alphanumeric(6).toUpperCase()}`;
};

// Generate a slug from a string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
};

// Add a unique suffix to a slug
const uniqueSlug = (baseSlug, counter) => {
  return `${baseSlug}-${counter}`;
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await db.sequelize.sync({ force: true });
    console.log('Database reset complete');

    // 1. Create Users
    console.log('Creating users...');
    const users = [];
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create admin user
    const adminUser = await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      password_hash: passwordHash,
      phone_number: '555-123-4567'
    });
    users.push(adminUser);

    // Create regular users
    for (let i = 0; i < 5; i++) {
      const user = await User.create({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password_hash: passwordHash,
        phone_number: faker.string.numeric(10).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
      });
      users.push(user);
    }

    // 2. Create Categories
    console.log('Creating categories...');
    const categories = [];
    const categoryNames = ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Watches'];

    for (const name of categoryNames) {
      const category = await Category.create({
        name,
        description: faker.lorem.paragraph(),
        slug: slugify(name)
      });
      categories.push(category);
    }

    // 3. Create Products
    console.log('Creating products...');
    const products = [];
    const karats = ['14K', '18K', '22K', '24K'];
    const slugCounter = {};

    for (let i = 0; i < 20; i++) {
      const categoryIndex = i % categories.length;
      const productName = `${faker.commerce.productAdjective()} ${categories[categoryIndex].name.slice(0, -1)}`;

      // Create base slug
      let baseSlug = slugify(productName);

      // Initialize counter for this base slug if not exists
      if (!slugCounter[baseSlug]) {
        slugCounter[baseSlug] = 0;
      }

      // Increment counter
      slugCounter[baseSlug]++;

      // Create unique slug with counter (only add counter if > 1)
      const slug = slugCounter[baseSlug] > 1 ? uniqueSlug(baseSlug, slugCounter[baseSlug]) : baseSlug;

      // Mark some products as featured (every 4th product)
      const is_featured = i % 4 === 0;

      const product = await Product.create({
        category_id: categories[categoryIndex].category_id,
        name: productName,
        description: faker.lorem.paragraphs(3),
        sku: generateSKU(),
        base_price: faker.number.float({ min: 100, max: 5000, multipleOf: 0.01 }),
        weight_grams: faker.number.float({ min: 5, max: 200, multipleOf: 0.1 }),
        karat: karats[Math.floor(Math.random() * karats.length)],
        stock_quantity: faker.number.int({ min: 0, max: 100 }),
        is_active: true,
        is_featured,
        slug
      });
      products.push(product);
    }

    // 4. Create Product Images
    console.log('Creating product images...');
    for (const product of products) {
      const imageCount = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < imageCount; i++) {
        await ProductImage.create({
          product_id: product.product_id,
          image_url: `https://source.unsplash.com/random/800x600/?jewelry,${product.name.replace(' ', ',')}`,
          alt_text: `${product.name} image ${i + 1}`,
          is_primary: i === 0, // First image is primary
          display_order: i
        });
      }
    }

    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await db.sequelize.close();
  }
}

// Run the seeding function
seedDatabase(); 