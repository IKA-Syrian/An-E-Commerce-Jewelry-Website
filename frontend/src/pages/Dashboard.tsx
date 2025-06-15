import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Package, MapPin, Settings, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthContext();
  const { orders, loading: ordersLoading } = useOrders();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Get the most recent orders
  const recentOrders = React.useMemo(() => {
    return orders
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 3);
  }, [orders]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Map status to a display name
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending_payment': 'Pending Payment',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  };

  // Extract member since date (year)
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).getFullYear()
    : 'N/A';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold mb-2">
            Welcome back, {user?.first_name || 'User'}
          </h1>
          <p className="text-gray-600">Manage your account and view your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/orders">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <Package className="h-6 w-6 text-gold mr-3" />
                    <div>
                      <CardTitle className="text-lg">Order History</CardTitle>
                      <CardDescription>View your past orders</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/addresses">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <MapPin className="h-6 w-6 text-gold mr-3" />
                    <div>
                      <CardTitle className="text-lg">Addresses</CardTitle>
                      <CardDescription>Manage shipping addresses</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/shop">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <ShoppingBag className="h-6 w-6 text-gold mr-3" />
                    <div>
                      <CardTitle className="text-lg">Shop</CardTitle>
                      <CardDescription>Browse our collections</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>

              <Link to="/profile">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <User className="h-6 w-6 text-gold mr-3" />
                    <div>
                      <CardTitle className="text-lg">Profile</CardTitle>
                      <CardDescription>Update your information</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest jewelry purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-2">
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded ml-auto"></div>
                        </div>
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map(order => (
                      <div key={order.order_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.order_id}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.order_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                          <p className="text-sm text-gray-600">{getStatusDisplay(order.status)}</p>
                        </div>
                        <Link to={`/orders/${order.order_id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">You haven't placed any orders yet.</p>
                    <Link to="/shop">
                      <Button className="btn-gold">Shop Now</Button>
                    </Link>
                  </div>
                )}
                
                {recentOrders.length > 0 && (
                  <div className="mt-4">
                    <Link to="/orders">
                      <Button variant="outline" className="w-full">View All Orders</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="font-medium">{user?.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Member Since</label>
                  <p className="font-medium">{memberSince}</p>
                </div>
                <Link to="/profile">
                  <Button className="btn-gold w-full">Edit Profile</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
