import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Edit, Trash2, MoveUp, MoveDown, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminService from '@/services/adminService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Interface for social media link
interface SocialMediaLink {
  link_id: number;
  platform_name: string;
  url: string;
  icon_class: string | null;
  display_order: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Schema for form validation
const socialMediaLinkSchema = z.object({
  platform_name: z.string().min(1, 'Platform name is required'),
  url: z.string().url('Must be a valid URL'),
  icon_class: z.string().optional(),
  is_active: z.boolean().default(true)
});

type SocialMediaLinkFormData = z.infer<typeof socialMediaLinkSchema>;

// List of common platform suggestions with icons
const platformSuggestions = [
  { name: 'Facebook', icon: 'facebook' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'Twitter', icon: 'twitter' },
  { name: 'LinkedIn', icon: 'linkedin' },
  { name: 'YouTube', icon: 'youtube' },
  { name: 'Pinterest', icon: 'pinterest' },
  { name: 'TikTok', icon: 'tiktok' },
  { name: 'Snapchat', icon: 'snapchat' },
  { name: 'WhatsApp', icon: 'whatsapp' }
];

const SocialMediaManagement = () => {
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLink, setSelectedLink] = useState<SocialMediaLink | null>(null);
  const { toast } = useToast();

  const form = useForm<SocialMediaLinkFormData>({
    resolver: zodResolver(socialMediaLinkSchema),
    defaultValues: {
      platform_name: '',
      url: '',
      icon_class: '',
      is_active: true
    }
  });

  // Load social media links on component mount
  useEffect(() => {
    fetchSocialMediaLinks();
  }, []);

  // Function to fetch social media links
  const fetchSocialMediaLinks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getSocialMediaLinks();
      setSocialMediaLinks(response);
    } catch (err) {
      console.error('Error fetching social media links:', err);
      setError('Failed to load social media links. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load social media links.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedLink(null);
    form.reset({
      platform_name: '',
      url: '',
      icon_class: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (link: SocialMediaLink) => {
    setSelectedLink(link);
    form.reset({
      platform_name: link.platform_name,
      url: link.url,
      icon_class: link.icon_class || '',
      is_active: link.is_active
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: SocialMediaLinkFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedLink) {
        // Update existing link
        await adminService.updateSocialMediaLink(selectedLink.link_id, {
          ...data,
          icon_class: data.icon_class || null
        });
        toast({
          title: 'Success',
          description: 'Social media link updated successfully.',
        });
      } else {
        // Create new link with display_order at the end
        const maxOrder = socialMediaLinks.length > 0 
          ? Math.max(...socialMediaLinks.map(link => link.display_order))
          : -1;
        
        await adminService.createSocialMediaLink({
          ...data,
          icon_class: data.icon_class || null,
          display_order: maxOrder + 1
        });
        toast({
          title: 'Success',
          description: 'Social media link created successfully.',
        });
      }
      
      // Close dialog and refresh
      setIsDialogOpen(false);
      fetchSocialMediaLinks();
    } catch (error) {
      console.error('Failed to save social media link:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save social media link.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (linkId: number) => {
    try {
      await adminService.deleteSocialMediaLink(linkId);
      toast({
        title: 'Success',
        description: 'Social media link deleted successfully.',
      });
      fetchSocialMediaLinks();
    } catch (error) {
      console.error('Failed to delete social media link:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete social media link.',
      });
    }
  };

  const handleToggleActive = async (linkId: number) => {
    try {
      await adminService.toggleSocialMediaLinkActive(linkId);
      toast({
        title: 'Success',
        description: 'Social media link status updated.',
      });
      fetchSocialMediaLinks();
    } catch (error) {
      console.error('Failed to toggle social media link status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update social media link status.',
      });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return; // Already at the top
    
    const updatedLinks = [...socialMediaLinks];
    const currentLink = updatedLinks[index];
    const aboveLink = updatedLinks[index - 1];
    
    // Swap display_order values
    const tempOrder = currentLink.display_order;
    currentLink.display_order = aboveLink.display_order;
    aboveLink.display_order = tempOrder;
    
    try {
      await adminService.updateSocialMediaLinkOrder([
        { link_id: currentLink.link_id, display_order: currentLink.display_order },
        { link_id: aboveLink.link_id, display_order: aboveLink.display_order }
      ]);
      
      // Re-fetch to ensure order is correct
      fetchSocialMediaLinks();
      
      toast({
        title: 'Success',
        description: 'Social media link order updated.',
      });
    } catch (error) {
      console.error('Failed to update social media link order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update social media link order.',
      });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= socialMediaLinks.length - 1) return; // Already at the bottom
    
    const updatedLinks = [...socialMediaLinks];
    const currentLink = updatedLinks[index];
    const belowLink = updatedLinks[index + 1];
    
    // Swap display_order values
    const tempOrder = currentLink.display_order;
    currentLink.display_order = belowLink.display_order;
    belowLink.display_order = tempOrder;
    
    try {
      await adminService.updateSocialMediaLinkOrder([
        { link_id: currentLink.link_id, display_order: currentLink.display_order },
        { link_id: belowLink.link_id, display_order: belowLink.display_order }
      ]);
      
      // Re-fetch to ensure order is correct
      fetchSocialMediaLinks();
      
      toast({
        title: 'Success',
        description: 'Social media link order updated.',
      });
    } catch (error) {
      console.error('Failed to update social media link order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update social media link order.',
      });
    }
  };

  // Suggest an icon class based on platform name
  const suggestIconClass = (platformName: string) => {
    const platform = platformSuggestions.find(
      p => p.name.toLowerCase() === platformName.toLowerCase()
    );
    return platform ? platform.icon : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media Management</h1>
          <p className="text-muted-foreground">Manage website social media links</p>
        </div>
        <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Social Link
            </Button>
      </div>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links ({socialMediaLinks.length})</CardTitle>
          <CardDescription>
            Add, edit or remove links to your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && socialMediaLinks.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading social media links...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button variant="outline" className="mt-4 mx-auto block" onClick={fetchSocialMediaLinks}>
                Try Again
              </Button>
            </div>
          ) : socialMediaLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No social media links found. Add your first social media link.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Icon Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {socialMediaLinks.map((link, index) => (
                  <TableRow key={link.link_id}>
                    <TableCell className="w-24">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className={index === 0 ? 'opacity-30' : ''}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMoveDown(index)}
                          disabled={index === socialMediaLinks.length - 1}
                          className={index === socialMediaLinks.length - 1 ? 'opacity-30' : ''}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{link.platform_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-40">{link.url}</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{link.icon_class || '—'}</TableCell>
                    <TableCell>
                      {link.is_active ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(link.link_id)}
                        >
                          {link.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
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
                              <AlertDialogTitle>Delete Social Media Link</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the {link.platform_name} social media link? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(link.link_id)}
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
          setSelectedLink(null);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
              {selectedLink ? 'Edit Social Media Link' : 'Add Social Media Link'}
              </DialogTitle>
              <DialogDescription>
              {selectedLink ? 'Update existing social media link' : 'Add a new social media profile link'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                name="platform_name"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>Platform Name*</FormLabel>
                      <FormControl>
                      <div>
                        <Input 
                          placeholder="Facebook, Instagram, etc." 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Suggest icon class when platform name changes
                            if (!selectedLink && !form.getValues('icon_class')) {
                              const suggestedIcon = suggestIconClass(e.target.value);
                              if (suggestedIcon) {
                                form.setValue('icon_class', suggestedIcon);
                              }
                            }
                          }}
                        />
                        {!selectedLink && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {platformSuggestions.map(platform => (
                              <Button
                                key={platform.name}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  form.setValue('platform_name', platform.name);
                                  form.setValue('icon_class', platform.icon);
                                }}
                                className="text-xs h-7"
                              >
                                {platform.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>URL*</FormLabel>
                      <FormControl>
                        <Input 
                        placeholder="https://facebook.com/yourpage" 
                          {...field} 
                        />
                      </FormControl>
                    <FormDescription>
                      Full URL to your social media profile
                    </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                name="icon_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon Class</FormLabel>
                      <FormControl>
                        <Input 
                        placeholder="fa-facebook" 
                          {...field} 
                        value={field.value || ''}
                        />
                      </FormControl>
                    <FormDescription>
                      CSS class for the icon (optional)
                    </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                name="is_active"
                  render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Display this social media link on the website
                      </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    selectedLink ? 'Update Link' : 'Add Link'
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
    </div>
  );
};

export default SocialMediaManagement;
