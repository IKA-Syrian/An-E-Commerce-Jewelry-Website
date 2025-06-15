export { default as categoryService } from './categoryService';
export { default as productService } from './productService';
export { default as userService } from './userService';

// Export types
export type { Category } from './categoryService';
export type { 
  Product, 
  ProductImage, 
  ProductsQueryParams 
} from './productService';
export type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse 
} from './userService'; 