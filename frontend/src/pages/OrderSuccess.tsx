import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface OrderDetail {
  order_id: number;
  status: string;
  created_at: string;
  total_amount: number;
  OrderItems?: {
    order_item_id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price_at_purchase: number;
    Product?: {
      name: string;
      sku: string;
      ProductImages?: {
        image_id: number;
        product_id: number;
        image_url: string;
        is_primary: boolean;
      }[];
    }
  }[];
}

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          setError('Order ID is missing');
          setLoading(false);
          return;
        }

        const response = await api.get(`/orders/${orderId}`);
        console.log('Order data:', response.data);
        setOrder(response.data);
      } catch (err) {
        setError('Failed to load order details. Please try again later.');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-playfair text-3xl font-bold mb-4">Order Information Unavailable</h1>
        <p className="text-gray-600 mb-8">{error || 'Order details could not be loaded.'}</p>
        <Button asChild className="btn-gold">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  // Format date for display
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-playfair text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-600">
            Your payment was successful and your order has been placed.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="font-playfair text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Order Number:</p>
              <p className="font-medium">{order.order_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date:</p>
              <p className="font-medium">{orderDate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Status:</p>
              <p className="font-medium">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {order.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total:</p>
              <p className="font-medium">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Order Items</h3>
            <div className="divide-y">
              {order.OrderItems && order.OrderItems.length > 0 ? (
                order.OrderItems.map((item) => {
                  // Get the primary image or the first image available
                  const productImages = item.Product?.ProductImages || [];
                  const primaryImage = productImages.find(img => img.is_primary);
                  const imageUrl = primaryImage 
                    ? primaryImage.image_url 
                    : productImages.length > 0 
                      ? productImages[0].image_url 
                      : `https://source.unsplash.com/random/100x100/?jewelry,gold,${encodeURIComponent(item.Product?.name || 'jewelry')}`;
                  
                  return (
                    <div key={item.order_item_id} className="py-3 flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 mr-4">
                        <img 
                          src={imageUrl} 
                          alt={item.Product?.name || `Product #${item.product_id}`} 
                          className="h-full w-full object-cover object-center rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{item.Product ? item.Product.name : `Product #${item.product_id}`}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.price_at_purchase * item.quantity)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 py-2">No items found in this order.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            A confirmation email has been sent to your email address.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="btn-gold">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            <Button asChild>
              <Link to="/orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 