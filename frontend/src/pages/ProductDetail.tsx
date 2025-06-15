import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ChevronRight, Minus, Plus, Heart } from 'lucide-react';
import { useProductById } from '@/hooks/useProducts';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { product, loading, error } = useProductById(id ? parseInt(id, 10) : null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          {error ? 'Error loading product' : 'Product not found'}
        </h2>
        <Button onClick={() => navigate('/shop')}>
          Return to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a href="/" className="text-sm text-gray-700 hover:text-gold">
              Home
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <a href="/shop" className="ml-1 text-sm text-gray-700 hover:text-gold md:ml-2">
                Shop
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">
                {product.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg mb-4">
            <img 
              src={product.ProductImages && product.ProductImages.length > 0 
                ? product.ProductImages[selectedImage].image_url 
                : 'https://via.placeholder.com/600?text=No+Image'}
              alt={product.name} 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.ProductImages && product.ProductImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-md overflow-hidden border-2 ${
                  selectedImage === idx ? 'border-gold' : 'border-transparent'
                }`}
              >
                <img 
                  src={img.image_url} 
                  alt={img.alt_text || `${product.name} thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="font-playfair text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-playfair font-medium text-gold mb-4">
            {formatCurrency(product.base_price)}
          </p>
          <p className="text-gray-700 mb-6">
            {product.description}
          </p>

          {/* Product Specifications */}
          <div className="mb-8 space-y-4">
            <div className="flex border-b pb-2">
              <span className="font-medium w-32">Material:</span>
              <span className="text-gray-700">{product.karat} Gold</span>
            </div>
            <div className="flex border-b pb-2">
              <span className="font-medium w-32">Weight:</span>
              <span className="text-gray-700">{product.weight_grams}g</span>
            </div>
            <div className="flex border-b pb-2">
              <span className="font-medium w-32">SKU:</span>
              <span className="text-gray-700">{product.sku}</span>
            </div>
            <div className="flex border-b pb-2">
              <span className="font-medium w-32">Availability:</span>
              <span className="text-gray-700">
                {product.stock_quantity > 0 
                  ? `In Stock (${product.stock_quantity} available)` 
                  : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="mr-4 font-medium">Quantity:</span>
            <div className="flex items-center border rounded-md">
              <button 
                onClick={decreaseQuantity}
                className="px-3 py-2 border-r hover:bg-gray-100"
                disabled={product.stock_quantity <= 0}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button 
                onClick={increaseQuantity}
                className="px-3 py-2 border-l hover:bg-gray-100"
                disabled={product.stock_quantity <= 0 || quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleAddToCart} 
              className="btn-gold flex-grow"
              size="lg"
              disabled={product.stock_quantity <= 0}
            >
              {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-12 w-12 border-gray-300"
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Add to wishlist</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
