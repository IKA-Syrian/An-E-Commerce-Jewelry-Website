import api from '../lib/api';
import { PaginatedResponse } from './productService';

export interface Category {
  category_id: number;
  name: string;
  description: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    
    // Handle both old and new response formats
    if (response.data && response.data.categories) {
      return response.data.categories;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Unexpected API response format:', response.data);
      return [];
    }
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  getWithProducts: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}/products`);
    return response.data;
  }
};

export default categoryService; 