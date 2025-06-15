const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testCategories() {
  console.log('\n--- Testing Categories ---');
  const categoriesResponse = await axios.get(`${API_URL}/categories`);
  console.log(`Found ${categoriesResponse.data.length} categories`);
  console.log('Categories:', categoriesResponse.data.map(c => c.name));
  return categoriesResponse.data;
}

async function testProducts() {
  console.log('\n--- Testing Products ---');
  const productsResponse = await axios.get(`${API_URL}/products`);
  console.log(`Found ${productsResponse.data.length} products`);
  console.log('Sample products:');
  productsResponse.data.slice(0, 3).forEach(product => {
    console.log(`- ${product.name} ($${product.base_price}) - ${product.slug}`);
  });
  
  // Test a single product endpoint
  if (productsResponse.data.length > 0) {
    const productId = productsResponse.data[0].product_id;
    console.log(`\n--- Testing Single Product (ID: ${productId}) ---`);
    const productResponse = await axios.get(`${API_URL}/products/${productId}`);
    console.log('Product details:');
    console.log(`- Name: ${productResponse.data.name}`);
    console.log(`- Category: ${productResponse.data.Category?.name || 'N/A'}`);
    console.log(`- Price: $${productResponse.data.base_price}`);
    console.log(`- Images: ${productResponse.data.ProductImages?.length || 0} images`);
  }
  
  return productsResponse.data;
}

// Test user login
async function testLogin() {
  try {
    console.log('\n--- Testing Login API ---');
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('User ID:', response.data.user.user_id);
    console.log('Email:', response.data.user.email);
    console.log('Token received:', response.data.token);
    
    // Decode the token to verify format
    const tokenData = Buffer.from(response.data.token, 'base64').toString();
    console.log('Decoded token:', tokenData);
    
    return response.data.token;
  } catch (error) {
    console.error('Login test failed:', error.response?.data || error.message);
    return null;
  }
}

async function testAddresses(token) {
  try {
    console.log('\n--- Testing Addresses API ---');
    // Test using the token for an authenticated request
    const authResponse = await axios.get(`${API_URL}/addresses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Authenticated request successful!');
    console.log(`Found ${authResponse.data.length} addresses`);
    authResponse.data.forEach(address => {
      console.log(`- ${address.address_line1}, ${address.city}, ${address.state_province} (${address.address_type}${address.is_default ? ', default' : ''})`);
    });
    
    return authResponse.data;
  } catch (error) {
    console.error('Address test failed:', error.response?.data || error.message);
    return null;
  }
}

// Run all the tests
async function runTests() {
  try {
    console.log('Testing API endpoints with seeded data...');
    
    // Test public endpoints
    await testCategories();
    await testProducts();
    
    // Test authenticated endpoints
    const token = await testLogin();
    
    if (!token) {
      console.error('Cannot proceed with authenticated tests without valid token');
      return;
    }
    
    await testAddresses(token);
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
runTests().catch(console.error); 