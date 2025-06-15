const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const db = require('../models');

// Models
const { User, Category, Product, ProductImage, CartItem, Order,
  OrderItem, Payment, Address, GoldPrice,
  SiteContent, SocialMediaLink, ContactInquiry } = db;

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
      phone_number: '555-123-4567',
      is_admin: true
    });
    users.push(adminUser);

    // Create regular users
    for (let i = 0; i < 10; i++) {
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

    for (let i = 0; i < 30; i++) {
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
        slug
      });
      products.push(product);
    }

    // 4. Create Product Images
    console.log('Creating product images...');
    for (const product of products) {
      const imageCount = faker.number.int({ min: 1, max: 5 });
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

    // 5. Create Addresses
    console.log('Creating addresses...');
    for (const user of users) {
      const addressCount = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < addressCount; i++) {
        await Address.create({
          user_id: user.user_id,
          address_line1: faker.location.streetAddress(),
          address_line2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }),
          city: faker.location.city(),
          state_province: faker.location.state(),
          postal_code: faker.location.zipCode(),
          country: 'United States',
          is_default: i === 0, // First address is default
          address_type: i === 0 ? 'shipping' : (Math.random() > 0.5 ? 'shipping' : 'billing')
        });
      }
    }

    // 6. Create Cart Items
    console.log('Creating cart items...');
    for (let i = 0; i < 5; i++) {
      const user = users[faker.number.int({ min: 0, max: users.length - 1 })];
      const product = products[faker.number.int({ min: 0, max: products.length - 1 })];

      // Check if user already has this product in cart
      const existingCartItem = await CartItem.findOne({
        where: {
          user_id: user.user_id,
          product_id: product.product_id
        }
      });

      if (!existingCartItem) {
        await CartItem.create({
          user_id: user.user_id,
          product_id: product.product_id,
          quantity: faker.number.int({ min: 1, max: 5 }),
          price_at_addition: product.base_price,
          added_at: faker.date.recent({ days: 30 })
        });
      }
    }

    // 7. Create Gold Prices
    console.log('Creating gold prices...');
    const pastDates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });

    for (const date of pastDates) {
      await GoldPrice.create({
        price_per_gram_24k: faker.number.float({ min: 50, max: 70, multipleOf: 0.01 }),
        timestamp: date,
        source_api: 'Sample Data API'
      });
    }

    // 8. Create Orders
    console.log('Creating orders...');
    const orderStatuses = ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'];
    const orders = [];

    for (let i = 0; i < 20; i++) {
      const user = users[faker.number.int({ min: 0, max: users.length - 1 })];
      const orderDate = faker.date.recent({ days: 90 });
      const status = orderStatuses[faker.number.int({ min: 0, max: orderStatuses.length - 1 })];

      // Get user's default address
      const userAddress = await Address.findOne({
        where: {
          user_id: user.user_id,
          is_default: true
        }
      });

      const order = await Order.create({
        user_id: user.user_id,
        order_date: orderDate,
        shipping_address_id: userAddress ? userAddress.address_id : null,
        billing_address_id: userAddress ? userAddress.address_id : null,
        status,
        shipping_method: faker.helpers.arrayElement(['Standard', 'Express', 'Overnight']),
        shipping_cost: faker.number.float({ min: 5, max: 25, multipleOf: 0.01 }),
        tax_amount: faker.number.float({ min: 10, max: 100, multipleOf: 0.01 }),
        total_amount: 0, // Will calculate after adding items
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 })
      });
      orders.push(order);

      // Add Order Items
      const itemCount = faker.number.int({ min: 1, max: 5 });
      let totalAmount = order.shipping_cost + order.tax_amount;

      for (let j = 0; j < itemCount; j++) {
        const product = products[faker.number.int({ min: 0, max: products.length - 1 })];
        const quantity = faker.number.int({ min: 1, max: 3 });
        const price = product.base_price;
        const subtotal = price * quantity;

        await OrderItem.create({
          order_id: order.order_id,
          product_id: product.product_id,
          quantity,
          price_at_purchase: price,
          subtotal
        });

        totalAmount += subtotal;
      }

      // Update order total
      await order.update({ total_amount: totalAmount });

      // Add payment for completed orders
      if (['shipped', 'delivered'].includes(status)) {
        await Payment.create({
          order_id: order.order_id,
          payment_date: new Date(orderDate.getTime() + 1000 * 60 * 60), // 1 hour after order
          amount: Number(totalAmount),
          payment_method: faker.helpers.arrayElement(['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER']),
          transaction_id: faker.string.alphanumeric(16),
          status: 'succeeded'
        });
      }
    }

    // 9. Create Site Content
    console.log('Creating site content...');
    const contentTypes = ['ABOUT_US', 'CONTACT_US', 'PRIVACY_POLICY', 'TERMS_CONDITIONS', 'FAQ', 'HOME_BANNER'];

    for (const type of contentTypes) {
      await SiteContent.create({
        content_key: type.toLowerCase(),
        title: `${type.replace('_', ' ')} Page`,
        content_value: faker.lorem.paragraphs(5),
        last_updated_by: adminUser.user_id
      });
    }

    // 10. Create Social Media Links
    console.log('Creating social media links...');
    const socialMedia = [
      { platform_name: 'Facebook', url: 'https://facebook.com/goldenthreadjewelry', icon_class: 'fab fa-facebook' },
      { platform_name: 'Instagram', url: 'https://instagram.com/goldenthreadjewelry', icon_class: 'fab fa-instagram' },
      { platform_name: 'Twitter', url: 'https://twitter.com/goldenthreadjw', icon_class: 'fab fa-twitter' },
      { platform_name: 'Pinterest', url: 'https://pinterest.com/goldenthreadjw', icon_class: 'fab fa-pinterest' }
    ];

    for (let i = 0; i < socialMedia.length; i++) {
      const social = socialMedia[i];
      await SocialMediaLink.create({
        platform_name: social.platform_name,
        url: social.url,
        icon_class: social.icon_class,
        display_order: i,
        is_active: true
      });
    }

    // 11. Create Contact Inquiries
    console.log('Creating contact inquiries...');
    for (let i = 0; i < 15; i++) {
      await ContactInquiry.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }),
        subject: faker.helpers.arrayElement(['Product Inquiry', 'Order Status', 'Return Request', 'General Question']),
        message: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['NEW', 'IN_PROGRESS', 'RESOLVED']),
        created_at: faker.date.recent({ days: 60 })
      });
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