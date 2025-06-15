import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2, Loader2, Search, EyeIcon, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminService from '@/services/adminService';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Interface for site content
interface SiteContent {
  content_id: number;
  content_key: string;
  title: string | null;
  content_value: string;
  last_updated_by: number | null;
  updatedAt: string;
  LastUpdatedByAdmin?: {
    user_id: number;
    first_name: string;
    last_name: string;
  };
}

// Schema for content form
const contentSchema = z.object({
  content_key: z.string().min(3, 'Key must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Key can only contain lowercase letters, numbers, and underscores'),
  title: z.string().optional(),
  content_value: z.string().min(1, 'Content is required')
});

type ContentFormData = z.infer<typeof contentSchema>;

const SiteContentManagement = () => {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SiteContent | null>(null);
  const { toast } = useToast();

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      content_key: '',
      title: '',
      content_value: ''
    }
  });

  // Load content on component mount
  useEffect(() => {
    fetchSiteContent();
  }, []);

  // Function to fetch site content
  const fetchSiteContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getSiteContent();
      setContents(response);
    } catch (err) {
      console.error('Error fetching site content:', err);
      setError('Failed to load site content. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load site content.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter content based on search term
  const filteredContents = contents.filter(content => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      content.content_key.toLowerCase().includes(searchLower) ||
      (content.title && content.title.toLowerCase().includes(searchLower)) ||
      content.content_value.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (content: SiteContent) => {
    setSelectedContent(content);
    form.reset({
      content_key: content.content_key,
      title: content.title || '',
      content_value: content.content_value
    });
    setIsDialogOpen(true);
  };

  const handleView = (content: SiteContent) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedContent(null);
    form.reset({
      content_key: '',
      title: '',
      content_value: ''
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ContentFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedContent) {
        // Update existing content
        await adminService.updateSiteContent(selectedContent.content_key, {
          title: data.title,
          content_value: data.content_value
        });
        toast({
          title: 'Success',
          description: 'Site content updated successfully.',
        });
      } else {
        // Create new content
        await adminService.createSiteContent({
          content_key: data.content_key,
          title: data.title,
          content_value: data.content_value
        });
        toast({
          title: 'Success',
          description: 'Site content created successfully.',
        });
      }
      
      // Close dialog and refresh
      setIsDialogOpen(false);
      fetchSiteContent();
    } catch (error) {
      console.error('Failed to save site content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save site content.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contentKey: string) => {
    try {
      await adminService.deleteSiteContent(contentKey);
      toast({
        title: 'Success',
        description: 'Site content deleted successfully.',
      });
      fetchSiteContent();
    } catch (error) {
      console.error('Failed to delete site content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete site content.',
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format updated by info
  const formatUpdatedBy = (content: SiteContent) => {
    if (!content.LastUpdatedByAdmin) return 'Unknown';
    return `${content.LastUpdatedByAdmin.first_name} ${content.LastUpdatedByAdmin.last_name}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Content Management</h1>
          <p className="text-muted-foreground">Manage website content and text</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by key, title, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Site Content ({filteredContents.length})</CardTitle>
          <CardDescription>
            Edit or update website text and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading content...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button variant="outline" className="mt-4 mx-auto block" onClick={fetchSiteContent}>
                Try Again
              </Button>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No content matches your search.' : 'No content found. Create your first content item.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Updated By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContents.map((content) => (
                  <TableRow key={content.content_id}>
                    <TableCell className="font-mono">{content.content_key}</TableCell>
                    <TableCell>{content.title || '—'}</TableCell>
                    <TableCell>
                      {content.content_value.length > 50
                        ? `${content.content_value.substring(0, 50)}...`
                        : content.content_value}
                    </TableCell>
                    <TableCell>{formatDate(content.updatedAt)}</TableCell>
                    <TableCell>{formatUpdatedBy(content)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(content)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(content)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Content</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{content.content_key}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(content.content_key)}
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedContent(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContent ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
            <DialogDescription>
              {selectedContent ? 'Update existing site content' : 'Create new site content item'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Key*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="about_us_heading" 
                        {...field}
                        disabled={!!selectedContent} // Disable editing key for existing content
                      />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for this content (lowercase, numbers, underscore)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="About Us Heading" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional descriptive title for easier identification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Content text..." 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      HTML is supported for rich formatting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    selectedContent ? 'Update Content' : 'Create Content'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContent?.title || selectedContent?.content_key}
            </DialogTitle>
            <DialogDescription>
              Content details
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Content Key</h3>
                <p className="font-mono text-sm mt-1">{selectedContent.content_key}</p>
              </div>
              
              {selectedContent.title && (
                <div>
                  <h3 className="text-sm font-medium">Title</h3>
                  <p className="mt-1">{selectedContent.title}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium">Content Value</h3>
                <div className="mt-1 border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                  <pre className="text-sm whitespace-pre-wrap break-words">{selectedContent.content_value}</pre>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Last Updated</h3>
                  <p className="text-sm mt-1">{formatDate(selectedContent.updatedAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Updated By</h3>
                  <p className="text-sm mt-1">{formatUpdatedBy(selectedContent)}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => handleEdit(selectedContent)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
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

export default SiteContentManagement;
