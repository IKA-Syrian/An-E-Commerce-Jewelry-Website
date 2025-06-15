import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Search, Eye, Check, Trash2, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminService from '@/services/adminService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Interface for contact inquiry
interface ContactInquiry {
  inquiry_id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  received_at: string;
  is_resolved: boolean;
  resolved_at: string | null;
  notes: string | null;
}

// Schema for notes form
const notesSchema = z.object({
  notes: z.string().optional()
});

type NotesFormData = z.infer<typeof notesSchema>;

const InquiriesManagement = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const form = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: ''
    }
  });

  // Load inquiries on component mount and when page/filters change
  useEffect(() => {
    fetchInquiries();
  }, [currentPage, statusFilter]);

  // Function to fetch inquiries
  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build filters object
      const filters = {
        search: searchTerm.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter
      };
      
      const response = await adminService.getInquiries(currentPage, itemsPerPage, filters);
      
      if (response.inquiries && Array.isArray(response.inquiries)) {
        setInquiries(response.inquiries);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || 1);
        setTotalItems(response.totalItems || 0);
      } else {
        // Fallback for old API format
        setInquiries(Array.isArray(response) ? response : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(response) ? response.length : 0);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries. Please try again later.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load inquiries.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when search changes
    fetchInquiries();
  };

  // Handle page change
  const goToPage = (page: number) => {
    if (page === currentPage) return; // Don't reload if same page
    setCurrentPage(page);
  };

  const handleViewInquiry = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailOpen(true);
  };

  const handleAddNotes = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    form.reset({ notes: inquiry.notes || '' });
    setIsNotesDialogOpen(true);
  };

  const onSubmitNotes = async (data: NotesFormData) => {
    if (!selectedInquiry) return;
    
    setIsSubmitting(true);
    try {
      await adminService.updateInquiry(selectedInquiry.inquiry_id, {
        notes: data.notes
      });
      
      toast({
        title: 'Success',
        description: 'Notes updated successfully.',
      });
      
      // Close dialog and refresh
      setIsNotesDialogOpen(false);
      fetchInquiries();
    } catch (error) {
      console.error('Failed to update notes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update notes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveInquiry = async (inquiryId: number) => {
    setIsSubmitting(true);
    try {
      await adminService.resolveInquiry(inquiryId);
      
      toast({
        title: 'Success',
        description: 'Inquiry marked as resolved.',
      });
      
      fetchInquiries();
    } catch (error) {
      console.error('Failed to resolve inquiry:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to resolve inquiry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInquiry = async (inquiryId: number) => {
    try {
      await adminService.deleteInquiry(inquiryId);
      
      toast({
        title: 'Success',
        description: 'Inquiry deleted successfully.',
      });
      
      // Close dialog if open
      if (selectedInquiry && selectedInquiry.inquiry_id === inquiryId) {
        setIsDetailOpen(false);
      }
      
      fetchInquiries();
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete inquiry.',
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inquiries Management</h1>
          <p className="text-muted-foreground">Manage customer inquiries and messages</p>
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
                  placeholder="Search by name, email, subject, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Inquiries</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inquiries ({totalItems})</CardTitle>
          <CardDescription>
            Customer contact messages and inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !inquiries.length ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading inquiries...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button variant="outline" className="mt-4 mx-auto block" onClick={fetchInquiries}>
                Try Again
              </Button>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inquiries found. Adjust your search or filters to see more results.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.inquiry_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inquiry.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <span>{inquiry.email}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground"
                              onClick={() => handleEmailClick(inquiry.email)}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{inquiry.subject || 'No Subject'}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(inquiry.received_at)}</TableCell>
                      <TableCell>
                        <Badge variant={inquiry.is_resolved ? 'success' : 'secondary'}>
                          {inquiry.is_resolved ? 'Resolved' : 'Unresolved'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInquiry(inquiry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!inquiry.is_resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResolveInquiry(inquiry.inquiry_id)}
                              disabled={isSubmitting}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
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
                                <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this inquiry? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteInquiry(inquiry.inquiry_id)}
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
                    Showing {inquiries.length} of {totalItems} inquiries
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

      {/* Inquiry Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Inquiry Details
            </DialogTitle>
            <DialogDescription>
              View and manage customer inquiry
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sender Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Name:</strong> {selectedInquiry.name}</div>
                    <div className="flex items-center gap-2">
                      <strong>Email:</strong> 
                      <span>{selectedInquiry.email}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmailClick(selectedInquiry.email)}
                      >
                        Reply via Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <Badge variant={selectedInquiry.is_resolved ? 'success' : 'secondary'}>
                        {selectedInquiry.is_resolved ? 'Resolved' : 'Unresolved'}
                      </Badge>
                    </div>
                    <div><strong>Received:</strong> {formatDate(selectedInquiry.received_at)}</div>
                    {selectedInquiry.is_resolved && (
                      <div><strong>Resolved:</strong> {formatDate(selectedInquiry.resolved_at)}</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="font-medium text-lg">{selectedInquiry.subject || 'No Subject'}</div>
                    <div className="mt-2 whitespace-pre-wrap">{selectedInquiry.message}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Notes</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddNotes(selectedInquiry)}
                  >
                    {selectedInquiry.notes ? 'Edit Notes' : 'Add Notes'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {selectedInquiry.notes ? (
                    <div className="whitespace-pre-wrap">{selectedInquiry.notes}</div>
                  ) : (
                    <div className="text-muted-foreground italic">No notes added yet.</div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  {!selectedInquiry.is_resolved && (
                    <Button 
                      onClick={() => handleResolveInquiry(selectedInquiry.inquiry_id)}
                      disabled={isSubmitting}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Inquiry
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this inquiry? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteInquiry(selectedInquiry.inquiry_id);
                            setIsDetailOpen(false);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedInquiry?.notes ? 'Edit Notes' : 'Add Notes'}
            </DialogTitle>
            <DialogDescription>
              Add internal notes for this inquiry
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNotes)} className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter notes about this inquiry..." 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      These notes are for internal use only
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
                    'Save Notes'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
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

export default InquiriesManagement;
