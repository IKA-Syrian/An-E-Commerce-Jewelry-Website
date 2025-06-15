
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
  new: boolean;
  material: string;
  weight: string;
  dimensions: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
