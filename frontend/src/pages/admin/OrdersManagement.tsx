import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Search, Eye, Truck, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminService from '@/services/adminService';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the Order status options
const ORDER_STATUSES = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'payment_confirmed', label: 'Payment Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

// Define interfaces for type safety
interface OrderItem {
  order_item_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
  Product: {
    name: string;
    sku: string;
  };
}

interface Address {
  address_id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface Order {
  order_id: number;
  user_id: number;
  order_date: string;
  status: string;
  total_amount: number;
  tracking_number?: string;
  User: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  ShippingAddress: Address;
  BillingAddress: Address;
  OrderItems: OrderItem[];
}

// Validation schema for the order update form
const orderUpdateSchema = z.object({
  status: z.string().min(1, 'Status is required'),
  trackingNumber: z.string().optional(),
  notes: z.string().optional()
});

type OrderUpdateForm = z.infer<typeof orderUpdateSchema>;

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const form = useForm<OrderUpdateForm>({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: {
      status: '',
      trackingNumber: '',
      notes: ''
    }
  });

  // Load orders on component mount and when page/filters change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  // Function to fetch orders with filters
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build filters object
      const filters = {
        search: searchTerm.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter
      };
      
      const response = await adminService.getOrders(currentPage, itemsPerPage, filters);
      
      if (response.orders && Array.isArray(response.orders)) {
        setOrders(response.orders);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || 1);
        setTotalItems(response.totalItems || 0);
      } else {
        // Fallback for old API format
        setOrders(Array.isArray(response) ? response : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(response) ? response.length : 0);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load orders.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when search changes
    fetchOrders();
  };

  // Handle page change
  const goToPage = (page: number) => {
    if (page === currentPage) return; // Don't reload if same page
    setCurrentPage(page);
  };

  const handleViewOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const orderDetails = await adminService.getOrder(orderId);
      setSelectedOrder(orderDetails);
      
      // Set form values
      form.reset({
        status: orderDetails.status,
        trackingNumber: orderDetails.tracking_number || '',
        notes: ''
      });
      
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Failed to load order details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load order details.'
      });
    } finally {
      setLoading(false);
    }
  };

  const onUpdateOrder = async (data: OrderUpdateForm) => {
    if (!selectedOrder) return;
    
    setIsSubmitting(true);
    try {
      await adminService.updateOrderStatus(
        selectedOrder.order_id, 
        data.status, 
        data.trackingNumber
      );
      
      // Update the order in the orders array
      setOrders(orders.map(order => 
        order.order_id === selectedOrder.order_id 
          ? { ...order, status: data.status, tracking_number: data.trackingNumber } 
          : order
      ));
      
      toast({
        title: 'Success',
        description: 'Order status updated successfully.',
      });
      
      setIsDetailOpen(false);
      // Refresh order list
      fetchOrders();
      
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update order status.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'secondary';
      case 'payment_confirmed': return 'default';
      case 'processing': return 'default';
      case 'shipped': return 'default';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      case 'refunded': return 'destructive';
      default: return 'secondary';
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    // Find matching status from ORDER_STATUSES array
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  // Format address for display
  const formatAddress = (address: Address) => {
    if (!address) return 'No address provided';
    return `${address.street}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Order ID, customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {ORDER_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({totalItems})</CardTitle>
          <CardDescription>
            Manage customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !orders.length ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button variant="outline" className="mt-4 mx-auto block" onClick={fetchOrders}>
                Try Again
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found. Adjust your search or filters to see more results.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-mono font-medium">#{order.order_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.User?.first_name} {order.User?.last_name}</div>
                          <div className="text-sm text-muted-foreground">{order.User?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">${order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(order.status)}>
                          {formatStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewOrder(order.order_id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 space-y-2">
                  <div className="text-sm text-muted-foreground text-center">
                    Showing {orders.length} of {totalItems} orders
                    {currentPage > 1 && totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => goToPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show current page, first page, last page, and pages around current
                          return page === 1 || 
                                 page === totalPages || 
                                 (page >= currentPage - 1 && page <= currentPage + 1);
                        })
                        .map((page, i, array) => {
                          // Add ellipsis
                          const showEllipsisBefore = i > 0 && array[i-1] !== page - 1;
                          const showEllipsisAfter = i < array.length - 1 && array[i+1] !== page + 1;
                          
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <PaginationItem>
                                  <span className="px-3 py-2">...</span>
                                </PaginationItem>
                              )}
                              
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => goToPage(page)}
                                  isActive={page === currentPage}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                              
                              {showEllipsisAfter && (
                                <PaginationItem>
                                  <span className="px-3 py-2">...</span>
                                </PaginationItem>
                              )}
                            </React.Fragment>
                          );
                        })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              View and update order information
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Name:</strong> {selectedOrder.User?.first_name} {selectedOrder.User?.last_name}</div>
                    <div><strong>Email:</strong> {selectedOrder.User?.email}</div>
                    <div><strong>Order Date:</strong> {new Date(selectedOrder.order_date).toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Status:</strong> {formatStatus(selectedOrder.status)}</div>
                    {selectedOrder.tracking_number && (
                      <div><strong>Tracking Number:</strong> {selectedOrder.tracking_number}</div>
                    )}
                    <div><strong>Total:</strong> ${selectedOrder.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{formatAddress(selectedOrder.ShippingAddress)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{formatAddress(selectedOrder.BillingAddress)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.OrderItems?.map((item) => (
                        <TableRow key={item.order_item_id}>
                          <TableCell>{item.Product?.name}</TableCell>
                          <TableCell className="font-mono">{item.Product?.sku}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.price_at_purchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>${(item.price_at_purchase * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Update Order Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onUpdateOrder)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ORDER_STATUSES.map(status => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="trackingNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tracking Number (if shipped)</FormLabel>
                            <FormControl>
                              <Input placeholder="TRK-123456" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Internal Notes</FormLabel>
                            <FormControl>
                              <Input placeholder="Add any internal notes..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Truck className="h-4 w-4 mr-2" />
                              Update Order
                            </>
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDetailOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
