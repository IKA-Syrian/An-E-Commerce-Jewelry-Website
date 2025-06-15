import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to check if admin is authenticated
export const verifyAdminAuth = () => {
  const adminToken = localStorage.getItem('adminJwt');
  const adminUser = localStorage.getItem('adminUser');
  return !!adminToken && !!adminUser;
};

// Helper function to check if a URL is admin-related
const isAdminRelatedUrl = (url?: string): boolean => {
  if (!url) return false;
  
  const adminEndpoints = [
    '/admin',
    '/orders',
    '/products',
    '/categories',
    '/users',
    '/contact-inquiries',
    '/gold-prices',
    '/site-content',
    '/social-media-links',
  ];
  
  return adminEndpoints.some(endpoint => url.includes(endpoint));
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get admin token
    const adminToken = localStorage.getItem('adminJwt');
    // Get user token
    const token = localStorage.getItem('jwt');
    
    // Always attach admin token if available for admin-related paths
    if (adminToken && isAdminRelatedUrl(config.url)) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      console.log(`Adding admin token to request: ${config.url}`);
    } 
    // Use regular token for non-admin requests if no admin token was used
    else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log authentication errors for debugging
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.config?.url, error.response?.data);
      
      // Check if this was an admin request
      if (isAdminRelatedUrl(error.config?.url) && localStorage.getItem('adminJwt')) {
        console.warn('Admin authentication failed, clearing credentials');
        localStorage.removeItem('adminJwt');
        localStorage.removeItem('adminUser');
        // Optionally redirect to admin login
        // window.location.href = '/admin/login';
      } else if (localStorage.getItem('jwt')) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        // Optionally redirect to login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 