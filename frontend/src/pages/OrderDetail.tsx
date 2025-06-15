import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Download, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import orderService, { Order } from '@/services/orderService';
import api from '@/lib/api';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, clearCart } = useCart();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        setError('Order ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(id);
        setOrder(orderData);
        
        // If the order doesn't belong to the current user, redirect to order history
        if (user && orderData.user_id !== user.user_id) {
          navigate('/orders');
          return;
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, user, navigate]);

  // Handle reorder functionality
  const handleReorder = async () => {
    if (!order) return;
    
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
  const handleDownloadInvoice = async () => {
    if (!order) return;
    
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

  // Calculate subtotal from order items
  const calculateSubtotal = (items: Order['OrderItems']) => {
    return items.reduce((total, item) => {
      return total + (item.price_at_purchase * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Link to="/orders" className="inline-flex items-center text-gold hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="bg-red-100 text-red-800 p-4 rounded-md">
            {error || "Order not found"}
          </div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal(order.OrderItems);
  // Assuming shipping is free and tax is fixed at 8% for this example
  const shipping = 0;
  const tax = subtotal * 0.08;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/orders" className="inline-flex items-center text-gold hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-bold">Order #{order.order_id}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.order_date).toLocaleDateString()}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {formatStatus(order.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.OrderItems.map(item => (
                    <div key={item.order_item_id} className="flex items-center space-x-4">
                      <img
                        src={item.Product.ProductImages[0].image_url || '/placeholder.svg'}
                        alt={item.Product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.Product.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.price_at_purchase)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Info */}
            {order.tracking_number && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">Tracking Number:</span> {order.tracking_number}</p>
                    <p><span className="font-medium">Shipping Method:</span> {order.shipping_method || 'Standard Shipping'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{order.User?.first_name} {order.User?.last_name}</p>
                    <p>{order.ShippingAddress.street_address}</p>
                    <p>{order.ShippingAddress.city}, {order.ShippingAddress.state} {order.ShippingAddress.postal_code}</p>
                    <p>{order.ShippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment & Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-sm text-gray-600">Credit Card (secure payment)</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="font-medium">{order.User?.first_name} {order.User?.last_name}</p>
                      <p>{order.BillingAddress.street_address}</p>
                      <p>{order.BillingAddress.city}, {order.BillingAddress.state} {order.BillingAddress.postal_code}</p>
                      <p>{order.BillingAddress.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {order.status.toLowerCase() !== 'cancelled' && (
                <Button 
                  className="btn-gold w-full"
                  onClick={handleReorder}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reorder Items
                </Button>
              )}
              <Button 
                className="w-full" 
                onClick={handleDownloadInvoice}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              <Button className="w-full">Contact Support</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
