import React from 'react';
import { Product } from '@/services/productService';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
}

const ProductGrid = ({ products, title }: ProductGridProps) => {
  // If no products, render empty grid
  if (!products || products.length === 0) {
    return (
      <div className="py-8">
        {title && (
          <h2 className="section-title">{title}</h2>
        )}
        <div className="text-center py-12 text-gray-500">
          No products found
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      {title && (
        <h2 className="section-title">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {products.map(product => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
