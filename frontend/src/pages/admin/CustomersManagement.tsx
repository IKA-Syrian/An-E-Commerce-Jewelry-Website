import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, ShieldCheck, ShieldX, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminService from '@/services/adminService';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define interfaces for type safety
interface Address {
  address_id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  address_type: string;
}

interface Order {
  order_id: number;
  order_date: string;
  status: string;
  total_amount: number;
}

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  is_admin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderSummary {
  user: User;
  orderStats: {
    order_count: number;
    total_spent: number;
  };
  recentOrders: Order[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrderSummary, setUserOrderSummary] = useState<OrderSummary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const itemsPerPage = 10;

  // Load users on component mount and when page/filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  // Function to fetch users with filters
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build filters object
      const filters = {
        search: searchTerm.trim() || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter
      };
      
      const response = await adminService.getCustomers(currentPage, itemsPerPage, filters);
      
      if (response.users && Array.isArray(response.users)) {
        setUsers(response.users);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || 1);
        setTotalItems(response.totalItems || 0);
      } else {
        // Fallback for old API format
        setUsers(Array.isArray(response) ? response : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(response) ? response.length : 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when search changes
    fetchUsers();
  };

  // Handle page change
  const goToPage = (page: number) => {
    if (page === currentPage) return; // Don't reload if same page
    setCurrentPage(page);
  };

  const handleViewUser = async (userId: number) => {
    try {
      setLoading(true);
      // First get basic user details
      const userDetails = await adminService.getCustomer(userId);
      setSelectedUser(userDetails);
      
      // Then get order summary for this user
      const orderSummary = await adminService.getCustomerOrderSummary(userId);
      setUserOrderSummary(orderSummary);
      
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Failed to load user details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load user details.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: number, currentIsAdmin: boolean) => {
    try {
      setIsSubmitting(true);
      const updatedUser = await adminService.updateUserRole(userId, !currentIsAdmin);
      
      // Update the user in the users array
      setUsers(users.map(user => 
        user.user_id === userId ? updatedUser : user
      ));
      
      toast({
        title: 'Success',
        description: `User role updated to ${updatedUser.is_admin ? 'Admin' : 'User'}.`,
      });
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user role.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format address for display
  const formatAddress = (address: Address) => {
    if (!address) return 'No address provided';
    return `${address.street}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}`;
  };

  // Format user name
  const formatUserName = (user: User) => {
    return `${user.first_name} ${user.last_name}`;
  };

  // Format order status badge variant
  const getOrderStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'default';
      case 'processing': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  // Get role badge variant
  const getRoleBadgeVariant = (isAdmin: boolean) => {
    return isAdmin ? 'destructive' : 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and assign admin privileges</p>
        </div>
      </div>

      {/* Search and Filter */}
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
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Select value={roleFilter} onValueChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({totalItems})</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !users.length ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button variant="outline" className="mt-4 mx-auto block" onClick={fetchUsers}>
                Try Again
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Adjust your search or filters to see more results.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatUserName(user)}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone_number && (
                            <div className="text-sm text-muted-foreground">{user.phone_number}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.is_admin)}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewUser(user.user_id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={isSubmitting}
                              >
                                {user.is_admin ? (
                                  <ShieldX className="h-4 w-4" />
                                ) : (
                                  <ShieldCheck className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {user.is_admin ? 'Remove Admin Role' : 'Promote to Admin'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to {user.is_admin ? 'remove admin privileges from' : 'promote'} this user? 
                                  {user.is_admin 
                                    ? ' They will no longer have access to admin features.' 
                                    : ' They will have full access to all admin features.'}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleToggleRole(user.user_id, user.is_admin)}
                                  className={user.is_admin ? '' : 'bg-red-600 hover:bg-red-700'}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 space-y-2">
                  <div className="text-sm text-muted-foreground text-center">
                    Showing {users.length} of {totalItems} users
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

      {/* User Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              User Details - {selectedUser && formatUserName(selectedUser)}
            </DialogTitle>
            <DialogDescription>
              View user information and order history
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && userOrderSummary && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Name:</strong> {formatUserName(selectedUser)}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    {selectedUser.phone_number && (
                      <div><strong>Phone:</strong> {selectedUser.phone_number}</div>
                    )}
                    <div><strong>Registration:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                    <div><strong>Role:</strong> 
                      <Badge className="ml-2" variant={getRoleBadgeVariant(selectedUser.is_admin)}>
                        {selectedUser.is_admin ? 'Admin' : 'User'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Total Orders:</strong> {userOrderSummary.orderStats.order_count || 0}</div>
                    <div><strong>Total Spent:</strong> ${Number(userOrderSummary.orderStats.total_spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    {userOrderSummary.orderStats.order_count > 0 && (
                      <div><strong>Average Order:</strong> ${(Number(userOrderSummary.orderStats.total_spent) / Number(userOrderSummary.orderStats.order_count)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {userOrderSummary.recentOrders && userOrderSummary.recentOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userOrderSummary.recentOrders.map((order: Order) => (
                          <TableRow key={order.order_id}>
                            <TableCell className="font-mono">#{order.order_id}</TableCell>
                            <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                            <TableCell>${order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            <TableCell>
                              <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No orders found for this user.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
