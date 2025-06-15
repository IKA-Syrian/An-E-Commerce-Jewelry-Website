import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="font-playfair text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any jewelry to your cart yet.
          </p>
          <Button asChild className="btn-gold">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-playfair text-3xl font-bold mb-8 text-center">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            {/* Cart Items */}
            <div className="divide-y">
              {cartItems.map((item) => {
                // Get the primary image or the first image available or use a placeholder
                const imageUrl = item.product.ProductImages && item.product.ProductImages.length > 0
                  ? item.product.ProductImages.find(img => img.is_primary)?.image_url || item.product.ProductImages[0].image_url
                  : `https://source.unsplash.com/random/400x400/?jewelry,gold,${encodeURIComponent(item.product.name)}`;
                
                return (
                  <div key={item.product.product_id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                    {/* Product */}
                    <div className="col-span-6 flex space-x-4">
                      <div className="h-20 w-20 flex-shrink-0">
                        <img 
                          src={imageUrl} 
                          alt={item.product.name} 
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          <Link 
                            to={`/product/${item.product.product_id}`} 
                            className="hover:text-gold transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        <button 
                          onClick={() => removeFromCart(item.product.product_id)} 
                          className="text-sm flex items-center text-red-500 hover:text-red-700 transition-colors mt-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 md:text-center">
                      <div className="flex justify-between md:block">
                        <span className="md:hidden">Price:</span>
                        <span>{formatCurrency(item.product.base_price)}</span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 md:text-center">
                      <div className="flex justify-between md:justify-center items-center">
                        <span className="md:hidden">Quantity:</span>
                        <div className="flex items-center border rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.product.stock_quantity <= item.quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 md:text-center font-medium">
                      <div className="flex justify-between md:block">
                        <span className="md:hidden">Total:</span>
                        <span>{formatCurrency(item.product.base_price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-playfair text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-600">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>
            
            <Button className="btn-gold w-full" size="lg" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            
            <div className="mt-4">
              <Button asChild variant="link" className="w-full text-gray-600">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
