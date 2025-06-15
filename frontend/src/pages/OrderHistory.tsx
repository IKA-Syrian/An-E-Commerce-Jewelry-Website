import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Eye, Download, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import orderService, { Order, OrderItem } from '@/services/orderService';
import api from '@/lib/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { addToCart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const orders = await orderService.getUserOrders(user.user_id);
        setOrders(orders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your order history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Handle reorder functionality
  const handleReorder = async (order: Order) => {
    try {
      // First clear the current cart
      clearCart();
      
      // For each order item, fetch the current product details and add to cart
      for (const item of order.OrderItems) {
        try {
          // Get current product details to ensure we have up-to-date pricing and stock
          const response = await api.get(`/products/${item.product_id}`);
          const currentProduct = response.data;
          
          // Add to cart with original quantity if available, otherwise max available
          const quantityToAdd = Math.min(item.quantity, currentProduct.stock_quantity);
          
          if (quantityToAdd > 0) {
            addToCart(currentProduct, quantityToAdd);
          } else {
            toast({
              title: "Product unavailable",
              description: `${item.Product.name} is currently out of stock`,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error(`Error fetching product ${item.product_id}:`, error);
          toast({
            title: "Product unavailable",
            description: `Could not add ${item.Product.name} to your cart`,
            variant: "destructive"
          });
        }
      }
      
      // Navigate to cart page
      toast({
        title: "Order reloaded",
        description: "Items from your previous order have been added to your cart"
      });
      navigate('/cart');
    } catch (error) {
      console.error('Reorder error:', error);
      toast({
        title: "Reorder failed",
        description: "There was a problem recreating your order",
        variant: "destructive"
      });
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = async (order: Order) => {
    try {
      // Simply call the service function we created
      await orderService.downloadInvoice(order);
      
      toast({
        title: "Invoice downloaded",
        description: "Your invoice has been downloaded successfully"
      });
    } catch (error) {
      console.error('Invoice download error:', error);
      toast({
        title: "Download failed",
        description: "There was a problem generating your invoice",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'pending_payment':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format the status for display
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate total number of items in an order
  const getTotalItems = (orderItems: OrderItem[]) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your jewelry orders</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.order_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Package className="h-6 w-6 text-gold" />
                    <div>
                      <CardTitle className="text-lg">Order #{order.order_id}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {formatStatus(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex overflow-x-auto space-x-4 pb-2">
                    {order.OrderItems.slice(0, 4).map((item) => {
                      // Get the primary image or first available image
                      const productImages = item.Product.ProductImages || [];
                      const primaryImage = productImages.find(img => img.is_primary);
                      const imageUrl = primaryImage 
                        ? primaryImage.image_url 
                        : productImages.length > 0 
                          ? productImages[0].image_url 
                          : `https://source.unsplash.com/random/80x80/?jewelry,gold,${encodeURIComponent(item.Product.name)}`;
                      
                      return (
                        <div key={item.order_item_id} className="flex-shrink-0">
                          <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={imageUrl} 
                              alt={item.Product.name} 
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                        </div>
                      );
                    })}
                    {order.OrderItems.length > 4 && (
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-sm text-gray-500">+{order.OrderItems.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-semibold">{getTotalItems(order.OrderItems)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold">{formatStatus(order.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tracking</p>
                      <p className="font-semibold">
                        {order.tracking_number || 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Link to={`/orders/${order.order_id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(order)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Invoice
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReorder(order)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reorder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start shopping to see your order history</p>
              <Link to="/shop">
                <Button className="btn-gold">Browse Jewelry</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
