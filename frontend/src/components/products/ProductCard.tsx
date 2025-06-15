import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/services/productService';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Handle potentially undefined or null product
  if (!product) {
    return <div className="product-card group">Product information unavailable</div>;
  }

  // Get the primary image or the first image available or use a placeholder
  const imageUrl = product.ProductImages && product.ProductImages.length > 0
    ? product.ProductImages.find(img => img.is_primary)?.image_url || product.ProductImages[0].image_url
    : `https://source.unsplash.com/random/400x400/?jewelry,gold,${encodeURIComponent(product.name || 'jewelry')}`;
    
  // Check if product is new (created within the last 7 days)
  const isNew = product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get a short description from the full description
  const shortDescription = React.useMemo(() => {
    if (!product.description) return '';
    // Get first sentence or limit to 100 chars
    const firstSentence = product.description.split('.')[0];
    return firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
  }, [product.description]);

  // Safely get product price
  const price = product.base_price || 0;

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.product_id}`}>
          <img 
            src={imageUrl} 
            alt={product.name || 'Product'} 
            className="w-full h-80 object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-gold text-white border-none">New</Badge>
          )}
          {product.stock_quantity !== undefined && product.stock_quantity <= 0 && (
            <Badge className="bg-red-500 text-white border-none">Sold Out</Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <Link to={`/product/${product.product_id}`}>
          <h3 className="font-playfair font-medium text-lg hover:text-gold transition-colors">
            {product.name || 'Unnamed Product'}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {shortDescription}
        </p>
        <p className="font-playfair font-bold text-lg mt-2">{formatCurrency(price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
