import api from '../lib/api';
import { Category } from './categoryService';

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  product_id: number;
  category_id: number;
  name: string;
  description: string;
  sku: string;
  base_price: number;
  weight_grams: number;
  karat: '14K' | '18K' | '21K' | '22K' | '24K';
  stock_quantity: number;
  is_active: boolean;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  Category?: Category;
  ProductImages?: ProductImage[];
  is_featured?: boolean;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_direction?: 'ASC' | 'DESC';
  featured?: boolean;
}

export interface PaginatedResponse<T> {
  totalItems: number;
  products?: T[];
  categories?: T[];
  inquiries?: T[];
  currentPage: number;
  totalPages: number;
}

const productService = {
  getAll: async (params?: ProductsQueryParams): Promise<Product[] | PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params });
    
    // Handle both old and new response formats
    if (response.data && response.data.products) {
      // New format with pagination
      return response.data;
    } else if (Array.isArray(response.data)) {
      // Old format (direct array)
      return response.data;
    } else {
      // Unexpected format, return empty array
      console.error('Unexpected API response format:', response.data);
      return [];
    }
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  getFeatured: async (): Promise<Product[]> => {
    // Get featured products
    const response = await api.get('/products', { 
      params: { featured: true } 
    });
    
    // Handle both old and new response formats
    if (response.data && response.data.products) {
      return response.data.products;
    }
    return response.data;
  },

  getByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await api.get(`/categories/${categoryId}/products`);
    
    // Handle both old and new response formats
    if (response.data && response.data.products) {
      return response.data.products;
    }
    return response.data;
  }
};

export default productService; 