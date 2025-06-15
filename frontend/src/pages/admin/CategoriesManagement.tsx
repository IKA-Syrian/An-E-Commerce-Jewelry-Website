import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminService from '@/services/adminService';
import { slugify } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Validation schema for the category form
const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional()
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const CategoriesManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: ''
    }
  });

  // Auto-generate slug when name changes
  const watchName = form.watch('name');
  useEffect(() => {
    if (watchName && !editingCategory) {
      form.setValue('slug', slugify(watchName));
    }
  }, [watchName, form, editingCategory]);

  // Load categories on component mount and when page changes
  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  // Function to fetch categories with filters
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Build filters object
      const filters = {
        search: searchTerm.trim() || undefined
      };
      
      // Fetch categories with constructed filters
      const response = await adminService.getCategories(currentPage, itemsPerPage, filters);
      
      console.log('Categories response:', response);
      
      // Handle the API response format
      if (response.categories && Array.isArray(response.categories)) {
        // New API response format with metadata
        setCategories(response.categories);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || 1);
        setTotalItems(response.totalItems || 0);
      } 
      // Handle array response (fallback for old format)
      else if (Array.isArray(response)) {
        setCategories(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } 
      // Default fallback
      else {
        setCategories(response || []);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load categories.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when search changes
    fetchCategories();
  };

  // Handle page change
  const goToPage = (page: number) => {
    if (page === currentPage) return; // Don't reload if same page
    setCurrentPage(page);
    // fetchCategories will be called automatically due to useEffect dependency on currentPage
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsDialogOpen(false); // Close dialog while processing
      
      if (editingCategory) {
        // Update existing category
        await adminService.updateCategory(editingCategory.category_id, data);
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        // Create new category
        await adminService.createCategory(data);
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
      }
      
      // Reset form and refresh categories
      setEditingCategory(null);
      form.reset();
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save category. Please try again.',
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    try {
      await adminService.deleteCategory(categoryId);
      // Remove the deleted category from the list
      setCategories(categories.filter(c => c.category_id !== categoryId));
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting category:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete category. It might be in use by products.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">Organize your product categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setEditingCategory(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              form.reset({
                name: '',
                slug: '',
                description: ''
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update category details' : 'Create a new product category'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Chains" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug*</FormLabel>
                      <FormControl>
                        <Input placeholder="chains" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the name. Generated automatically but can be edited.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Category description..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingCategory ? 'Update' : 'Create'} Category
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories ({totalItems})</CardTitle>
          <CardDescription>
            Manage your product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading categories...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button variant="outline" className="mt-4 mx-auto block" onClick={fetchCategories}>
                Try Again
              </Button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Create a new category to get started.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.category_id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                      <TableCell className="max-w-xs truncate">{category.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setCategoryToDelete(category.category_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                  Products in this category will not be deleted but will no longer have a category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.category_id)}
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
                    Showing {categories.length} of {totalItems} categories
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

export default CategoriesManagement;
