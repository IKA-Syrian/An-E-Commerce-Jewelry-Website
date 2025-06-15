import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminService from '@/services/adminService';
import { slugify } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminContext } from '@/context/AdminContext';
import { verifyAdminAuth } from '@/lib/api';

// Validation schema for the product form
const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  slug: z.string().optional(),
  category_id: z.string().min(1, 'Please select a category'),
  sku: z.string().optional(),
  base_price: z.number().min(0.01, 'Price must be greater than 0'),
  weight_grams: z.number().min(0, 'Weight cannot be negative').optional(),
  karat: z.string().optional(),
  stock_quantity: z.number().min(0, 'Stock cannot be negative').default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false)
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!productId;
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{image_id: number, image_url: string}>>([]);
  const [categories, setCategories] = useState<Array<{category_id: number, name: string}>>([]);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { refreshAdminToken } = useAdminContext();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      category_id: '',
      sku: '',
      base_price: 0,
      weight_grams: 0,
      karat: '24K',
      stock_quantity: 0,
      is_active: true,
      is_featured: false
    }
  });

  // Auto-generate slug when name changes
  const watchName = form.watch('name');
  useEffect(() => {
    if (watchName && !isEditing) {
      form.setValue('slug', slugify(watchName));
    }
  }, [watchName, form, isEditing]);

  // Verify admin authentication before loading data
  useEffect(() => {
    // Check if admin is authenticated
    if (!verifyAdminAuth()) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in as an admin to access this page.',
      });
      navigate('/admin/login');
      return;
    }
    
    // Refresh admin token to ensure it's valid
    refreshAdminToken();
  }, [navigate, toast, refreshAdminToken]);

  // Load categories and product data (if editing)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Make sure we're authenticated
        if (!verifyAdminAuth()) {
          return;
        }

        // Load categories
        const categoriesData = await adminService.getCategories();
        setCategories(categoriesData);

        // If editing, load product data
        if (isEditing && productId) {
          setIsLoadingData(true);
          const productData = await adminService.getProduct(parseInt(productId));
          
          // Set form values - ensure numeric fields are converted to numbers
          form.reset({
            name: productData.name,
            description: productData.description,
            slug: productData.slug,
            category_id: productData.category_id ? String(productData.category_id) : '',
            sku: productData.sku || '',
            base_price: typeof productData.base_price === 'string' ? parseFloat(productData.base_price) : productData.base_price,
            weight_grams: productData.weight_grams ? (typeof productData.weight_grams === 'string' ? parseFloat(productData.weight_grams) : productData.weight_grams) : 0,
            karat: productData.karat || '24K',
            stock_quantity: typeof productData.stock_quantity === 'string' ? parseInt(productData.stock_quantity) : productData.stock_quantity,
            is_active: productData.is_active,
            is_featured: productData.is_featured || false
          });

          // Load existing images
          if (productData.ProductImages && productData.ProductImages.length > 0) {
            setExistingImages(productData.ProductImages);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load necessary data. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load data. Please refresh the page or try again later.',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [productId, isEditing, form, toast, refreshAdminToken]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make sure we're authenticated
      if (!verifyAdminAuth()) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You must be logged in as an admin to perform this action.',
        });
        navigate('/admin/login');
        return;
      }
      
      // Refresh admin token to ensure it's valid
      refreshAdminToken();
      
      // Handle product creation or update
      let productResponse;
      
      if (isEditing && productId) {
        productResponse = await adminService.updateProduct(parseInt(productId), data);
        toast({
          title: 'Success',
          description: 'Product updated successfully.',
        });
      } else {
        productResponse = await adminService.createProduct(data);
        toast({
          title: 'Success',
          description: 'Product created successfully.',
        });
      }
      
      // Handle image uploads if there are any new images
      if (images.length > 0) {
        const productIdToUse = isEditing ? parseInt(productId as string) : productResponse.product_id;
        
        // Create FormData for each image
        for (let i = 0; i < images.length; i++) {
          const formData = new FormData();
          formData.append('image', images[i]);
          formData.append('is_primary', i === 0 && existingImages.length === 0 ? 'true' : 'false');
          formData.append('alt_text', data.name);
          
          await adminService.uploadProductImage(productIdToUse, formData);
        }
      }
      
      // Navigate back to products list
      navigate('/admin/products');
    } catch (err: unknown) {
      console.error('Failed to save product:', err);
      
      // Check if it's an authentication error
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 401) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
        });
        navigate('/admin/login');
      } else {
        setError('Failed to save product. Please check your input and try again.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save product. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages = Array.from(event.target.files);
      setImages((prev: File[]) => [...prev, ...newImages] as File[]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: number) => {
    if (!productId) return;
    
    try {
      await adminService.deleteProductImage(parseInt(productId), imageId);
      setExistingImages(prev => prev.filter(img => img.image_id !== imageId));
      toast({
        title: 'Success',
        description: 'Image removed successfully.',
      });
    } catch (err) {
      console.error('Failed to delete image:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove image. Please try again.',
      });
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update product details' : 'Create a new jewelry product'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Basic information about the product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Gold Chain 24K" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="GC-24K-001" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional unique identifier for this product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed product description..."
                            className="min-h-32"
                            {...field} 
                          />
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
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="gold-chain-24k" {...field} />
                        </FormControl>
                        <FormDescription>
                          The URL-friendly version of the name. Generated automatically but can be edited.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem 
                                  key={category.category_id} 
                                  value={String(category.category_id)}
                                >
                                  {category.name}
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
                      name="karat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Karat</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select karat" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="24K">24K</SelectItem>
                              <SelectItem value="22K">22K</SelectItem>
                              <SelectItem value="21K">21K</SelectItem>
                              <SelectItem value="18K">18K</SelectItem>
                              <SelectItem value="14K">14K</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="base_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price ($)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2850.00"
                              step="0.01"
                              {...field}
                              value={field.value}
                              onChange={e => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : parseFloat(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight_grams"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (grams)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25.5"
                              step="0.1"
                              {...field}
                              value={field.value}
                              onChange={e => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : parseFloat(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="15"
                              {...field}
                              value={field.value}
                              onChange={e => {
                                const value = e.target.value;
                                field.onChange(value === '' ? 0 : parseInt(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Active Product
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              This product will be visible to customers
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Featured Product
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              This product will be highlighted on the homepage
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        isEditing ? 'Update Product' : 'Create Product'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Image Upload */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload product photos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:text-primary/80">
                      Upload images
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 10MB each
                </p>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Current Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {existingImages.map((image) => (
                      <div key={image.image_id} className="relative">
                        <img
                          src={image.image_url}
                          alt="Product"
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeExistingImage(image.image_id)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">New Images to Upload</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
