import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Loader2, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminService from '@/services/adminService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Product {
  product_id: number;
  name: string;
  sku: string;
  category_id: number;
  base_price: number;
  stock_quantity: number;
  karat: string;
  is_active: boolean;
  Category?: {
    name: string;
  };
  ProductImages?: Array<{
    image_url: string;
  }>;
}

type SortField = 'name' | 'sku' | 'base_price' | 'stock_quantity' | 'karat' | 'is_active';
type SortDirection = 'ASC' | 'DESC';

const ProductsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{category_id: number, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Fetch products with current filters and sorting
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Build filters object
      const filters = {
        search: searchTerm.trim() || undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        isActive: statusFilter !== 'all' ? statusFilter === 'Active' : undefined
      };
      
      // Fetch products with constructed filters and sorting
      const response = await adminService.getProducts(
        currentPage, 
        itemsPerPage, 
        filters,
        sortField || undefined,
        sortDirection
      );
      
      console.log('Products response:', response);
      
      // Handle the updated API response format
      if (response.products && Array.isArray(response.products)) {
        // New API response format with metadata
        setProducts(response.products);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || 1);
        setTotalItems(response.totalItems || 0);
      } 
      // Handle array response (fallback for old format)
      else if (Array.isArray(response)) {
        setProducts(response);
        setTotalPages(1);
      } 
      // Handle response with data property
      else if (response.data) {
        setProducts(response.data);
        const total = response.totalItems || 0;
        setTotalPages(Math.ceil(total / itemsPerPage) || 1);
        setTotalItems(total);
      } 
      // Default fallback
      else {
        setProducts(response || []);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load products.',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, statusFilter, sortField, sortDirection, itemsPerPage, toast]);

  // Initial data loading
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories for filter dropdown
        const categoriesData = await adminService.getCategories();
        setCategories(categoriesData);
        
        // Load products (initial load)
        await fetchProducts();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load products and categories.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchProducts]); 

  // Debounced search function for automatic searching
  const debouncedSearch = useCallback(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search/filter changes
      fetchProducts();
    }, 500); // 500ms debounce delay

    setSearchTimeout(timeout);
  }, [fetchProducts, searchTimeout]);

  // Apply debounced search when search term changes
  useEffect(() => {
    debouncedSearch();
    // Cleanup function to clear timeout when component unmounts
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm, debouncedSearch]);

  // Handle manual search button click
  const handleSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setCurrentPage(1); // Reset to first page when search/filter changes
    fetchProducts();
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    // If clicking the same field, toggle sort direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('ASC');
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Render sort icon for table headers
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'ASC' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: number) => {
    try {
      await adminService.deleteProduct(productId);
      // Update products list after successful deletion
      setProducts(products.filter(product => product.product_id !== productId));
      toast({
        title: 'Success',
        description: 'Product deleted successfully.',
      });
    } catch (err: unknown) {
      console.error('Error deleting product:', err);

      // Type guard for axios error response
      const error = err as { response?: { data?: { message?: string, inUse?: boolean, orderCount?: number } } };

      // Check if the error response contains our custom message about product being in use
      const errorMessage = error.response?.data?.message || 'Failed to delete product.';
      const isInUse = error.response?.data?.inUse || false;
      const orderCount = error.response?.data?.orderCount || 0;

      if (isInUse) {
        toast({
          variant: 'destructive',
          title: 'Cannot Delete Product',
          description: `This product is used in ${orderCount} orders. Consider deactivating it instead.`,
        });
        
        // Close the dialog and navigate to edit screen to deactivate instead
        setProductToDelete(null);
        navigate(`/admin/products/edit/${productId}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      }
    }
  };

  // Handle page change
  const goToPage = (page: number) => {
    if (page === currentPage) return; // Don't reload if same page
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your jewelry inventory</p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Link>
        </Button>
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
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1); // Reset page
              setTimeout(() => fetchProducts(), 0);
            }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.category_id} value={String(category.category_id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1); // Reset page
              setTimeout(() => fetchProducts(), 0);
            }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({totalItems})</CardTitle>
          <CardDescription>
            Manage your product catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button variant="outline" className="mt-4 mx-auto block" onClick={fetchProducts}>
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found. Create a new product to get started.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        Name {renderSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('sku')}>
                      <div className="flex items-center">
                        SKU {renderSortIcon('sku')}
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('base_price')}>
                      <div className="flex items-center">
                        Price {renderSortIcon('base_price')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('stock_quantity')}>
                      <div className="flex items-center">
                        Stock {renderSortIcon('stock_quantity')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('karat')}>
                      <div className="flex items-center">
                        Karat {renderSortIcon('karat')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('is_active')}>
                      <div className="flex items-center">
                        Status {renderSortIcon('is_active')}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <img 
                          src={product.ProductImages && product.ProductImages.length > 0 
                            ? product.ProductImages[0].image_url 
                            : '/placeholder.svg'} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku || 'N/A'}</TableCell>
                      <TableCell>{product.Category?.name || 'Uncategorized'}</TableCell>
                      <TableCell>${product.base_price.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`${product.stock_quantity <= 5 ? 'text-red-600 font-semibold' : ''}`}>
                          {product.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell>{product.karat || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/products/edit/${product.product_id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setProductToDelete(product.product_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.product_id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
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
                    Showing {products.length} of {totalItems} products
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
    </div>
  );
};

export default ProductsList;
