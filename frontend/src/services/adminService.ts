import api from '../lib/api';

export interface AdminUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  user: AdminUser;
  token: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: any[];
  pendingOrders: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string | number;
  isActive?: boolean;
}

export interface CategoryFilters {
  search?: string;
}

const adminService = {
  login: async (credentials: AdminLoginCredentials): Promise<AdminAuthResponse> => {
    const response = await api.post('/users/admin/login', credentials);
    
    // Store the admin token and user data in localStorage
    if (response.data.user && response.data.token) {
      localStorage.setItem('adminJwt', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      
      // Log successful login for debugging
      console.log('Admin login successful, token stored');
    }
    
    return response.data;
  },

  logout: (): void => {
    // Remove all admin-related data from localStorage
    localStorage.removeItem('adminJwt');
    localStorage.removeItem('adminUser');
    
    // Clear any other potentially related data
    sessionStorage.removeItem('adminJwt');
    sessionStorage.removeItem('adminUser');
    
    // Log the logout for debugging
    console.log('Admin logout: Cleared all admin authentication data');
  },

  getCurrentAdmin: (): AdminUser | null => {
    const adminJson = localStorage.getItem('adminUser');
    return adminJson ? JSON.parse(adminJson) : null;
  },

  isAdminAuthenticated: (): boolean => {
    return !!localStorage.getItem('adminJwt');
  },

  // Dashboard statistics
  getDashboardStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Products
  getProducts: async (page = 1, limit = 10, filters: ProductFilters = {}, sortBy?: string, sortDirection: 'ASC' | 'DESC' = 'ASC') => {
    // Build query parameters
    const { search, categoryId, isActive } = filters;
    let queryParams = `page=${page}&limit=${limit}`;
    
    if (search) queryParams += `&search=${encodeURIComponent(search)}`;
    if (categoryId && categoryId !== 'all') queryParams += `&categoryId=${categoryId}`;
    if (isActive !== undefined) queryParams += `&isActive=${isActive}`;
    if (sortBy) queryParams += `&sort_by=${sortBy}&sort_direction=${sortDirection}`;
    
    const response = await api.get(`/products?${queryParams}`);
    return response.data;
  },

  getProduct: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: number, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Product Images
  uploadProductImage: async (productId: number, imageData: FormData) => {
    const response = await api.post(`/products/${productId}/images`, imageData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteProductImage: async (productId: number, imageId: number) => {
    const response = await api.delete(`/products/${productId}/images/${imageId}`);
    return response.data;
  },

  // Categories
  getCategories: async (page?: number, limit?: number, filters: CategoryFilters = {}) => {
    // Build query parameters
    const { search } = filters;
    let queryParams = '';
    
    // Add pagination params if provided
    if (page !== undefined) queryParams += `page=${page}`;
    if (limit !== undefined) queryParams += `${queryParams ? '&' : ''}limit=${limit}`;
    
    // Add search if provided
    if (search) queryParams += `${queryParams ? '&' : ''}search=${encodeURIComponent(search)}`;
    
    // Add query string to URL if params exist
    const url = queryParams ? `/categories?${queryParams}` : '/categories';
    
    const response = await api.get(url);
    return response.data;
  },

  createCategory: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: number, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Orders
  getOrders: async (page = 1, limit = 10, filters: { search?: string, status?: string } = {}) => {
    // Build query parameters
    const { search, status } = filters;
    let queryParams = `page=${page}&limit=${limit}`;
    
    if (search) queryParams += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') queryParams += `&status=${status}`;
    
    const response = await api.get(`/orders?${queryParams}`);
    return response.data;
  },

  getOrder: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string, trackingNumber?: string) => {
    const data: any = { status };
    
    // Add tracking number if provided
    if (trackingNumber) {
      data.tracking_number = trackingNumber;
    }
    
    const response = await api.put(`/orders/${id}/status`, data);
    return response.data;
  },

  // Customers
  getCustomers: async (page = 1, limit = 10, filters: { search?: string, role?: string } = {}) => {
    // Build query parameters
    const { search, role } = filters;
    let queryParams = `page=${page}&limit=${limit}`;
    
    if (search) queryParams += `&search=${encodeURIComponent(search)}`;
    if (role && role !== 'all') queryParams += `&role=${role}`;
    
    const response = await api.get(`/users?${queryParams}`);
    return response.data;
  },

  getCustomer: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getCustomerOrderSummary: async (id: number) => {
    const response = await api.get(`/users/${id}/order-summary`);
    return response.data;
  },

  updateUserRole: async (id: number, isAdmin: boolean) => {
    const response = await api.put(`/users/${id}/role`, { is_admin: isAdmin });
    return response.data;
  },

  // Contact inquiries
  getInquiries: async (page = 1, limit = 10, filters: { search?: string, status?: string } = {}) => {
    // Build query parameters
    const { search, status } = filters;
    let queryParams = `page=${page}&limit=${limit}`;
    
    if (search) queryParams += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') queryParams += `&status=${status}`;
    
    const response = await api.get(`/contact-inquiries?${queryParams}`);
    return response.data;
  },

  getInquiry: async (id: number) => {
    const response = await api.get(`/contact-inquiries/${id}`);
    return response.data;
  },

  updateInquiry: async (id: number, data: { notes?: string, is_resolved?: boolean }) => {
    const response = await api.put(`/contact-inquiries/${id}`, data);
    return response.data;
  },

  resolveInquiry: async (id: number, notes?: string) => {
    const response = await api.put(`/contact-inquiries/${id}/resolve`, { notes });
    return response.data;
  },

  deleteInquiry: async (id: number) => {
    const response = await api.delete(`/contact-inquiries/${id}`);
    return response.data;
  },

  // Gold Prices
  getGoldPrices: async (limit = 30) => {
    const response = await api.get(`/gold-prices?limit=${limit}`);
    return response.data;
  },

  createGoldPrice: async (priceData: any) => {
    const response = await api.post('/gold-prices', priceData);
    return response.data;
  },

  // Site Content
  getSiteContent: async () => {
    const response = await api.get('/site-content');
    return response.data;
  },

  getSiteContentByKey: async (key: string) => {
    const response = await api.get(`/site-content/${key}`);
    return response.data;
  },

  createSiteContent: async (contentData: {
    content_key: string;
    title?: string;
    content_value: string;
  }) => {
    const response = await api.post('/site-content', contentData);
    return response.data;
  },

  updateSiteContent: async (key: string, contentData: {
    title?: string;
    content_value: string;
  }) => {
    const response = await api.put(`/site-content/${key}`, contentData);
    return response.data;
  },

  deleteSiteContent: async (key: string) => {
    const response = await api.delete(`/site-content/${key}`);
    return response.data;
  },

  // Social Media Links
  getSocialMediaLinks: async () => {
    const response = await api.get('/social-media-links');
    return response.data;
  },

  getSocialMediaLink: async (id: number) => {
    const response = await api.get(`/social-media-links/${id}`);
    return response.data;
  },

  createSocialMediaLink: async (linkData: {
    platform_name: string;
    url: string;
    icon_class?: string;
    display_order?: number;
    is_active?: boolean;
  }) => {
    const response = await api.post('/social-media-links', linkData);
    return response.data;
  },

  updateSocialMediaLink: async (id: number, linkData: {
    platform_name?: string;
    url?: string;
    icon_class?: string;
    display_order?: number;
    is_active?: boolean;
  }) => {
    const response = await api.put(`/social-media-links/${id}`, linkData);
    return response.data;
  },

  deleteSocialMediaLink: async (id: number) => {
    const response = await api.delete(`/social-media-links/${id}`);
    return response.data;
  },

  updateSocialMediaLinkOrder: async (links: Array<{ link_id: number, display_order: number }>) => {
    const response = await api.post('/social-media-links/update-order', links);
    return response.data;
  },

  toggleSocialMediaLinkActive: async (id: number) => {
    const response = await api.put(`/social-media-links/${id}/toggle-active`);
    return response.data;
  }
};

export default adminService; 