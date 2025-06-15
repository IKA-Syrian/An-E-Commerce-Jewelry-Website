import React, { useState } from 'react';
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { useAddresses } from '@/hooks/useAddresses';
import { CreateAddressData } from '@/services/addressService';

const AddressManagement = () => {
  const { toast } = useToast();
  const { 
    addresses, 
    loading, 
    error, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
  } = useAddresses();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateAddressData>({
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'United States',
    is_default: false,
    address_type: 'shipping'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingAddressId) {
        // Update existing address
        await updateAddress(editingAddressId, formData);
        toast({
          title: "Address updated",
          description: "Your address has been successfully updated.",
        });
      } else {
        // Add new address
        await addAddress(formData);
        toast({
          title: "Address added",
          description: "Your new address has been successfully saved.",
        });
      }
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setEditingAddressId(null);
      resetForm();
    } catch (err) {
      console.error('Error saving address:', err);
      toast({
        title: "Error",
        description: "There was a problem saving your address. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      address_line1: '',
      address_line2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'United States',
      is_default: false,
      address_type: 'shipping'
    });
  };

  const handleEdit = (addressId: number) => {
    const addressToEdit = addresses.find(addr => addr.address_id === addressId);
    if (!addressToEdit) return;
    
    setEditingAddressId(addressId);
    setFormData({
      address_line1: addressToEdit.address_line1,
      address_line2: addressToEdit.address_line2 || '',
      city: addressToEdit.city,
      state_province: addressToEdit.state_province,
      postal_code: addressToEdit.postal_code,
      country: addressToEdit.country,
      is_default: addressToEdit.is_default,
      address_type: addressToEdit.address_type
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (addressId: number) => {
    try {
      await deleteAddress(addressId);
      toast({
        title: "Address deleted",
        description: "The address has been removed from your account.",
      });
    } catch (err) {
      console.error('Error deleting address:', err);
      toast({
        title: "Error",
        description: "There was a problem deleting your address. It may be used in existing orders.",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await setDefaultAddress(addressId);
      toast({
        title: "Default address updated",
        description: "Your default address has been updated.",
      });
    } catch (err) {
      console.error('Error setting default address:', err);
      toast({
        title: "Error",
        description: "There was a problem setting your default address.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold mb-2">Address Management</h1>
            <p className="text-gray-600">Manage your shipping and billing addresses</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line1">Street Address</Label>
                  <Input
                    id="address_line1"
                    value={formData.address_line1}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address_line2">Apartment, Suite, Unit (Optional)</Label>
                  <Input
                    id="address_line2"
                    value={formData.address_line2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state_province">State/Province</Label>
                    <Input
                      id="state_province"
                      value={formData.state_province}
                      onChange={(e) => setFormData(prev => ({ ...prev, state_province: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shipping"
                      checked={formData.address_type === 'shipping'}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, address_type: checked ? 'shipping' : 'billing' }))
                      }
                    />
                    <Label htmlFor="shipping">Use as shipping address</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="billing"
                      checked={formData.address_type === 'billing'}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, address_type: checked ? 'billing' : 'shipping' }))
                      }
                    />
                    <Label htmlFor="billing">Use as billing address</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, is_default: !!checked }))
                      }
                    />
                    <Label htmlFor="default">Set as default address</Label>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="btn-gold flex-1" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size="sm" /> : (editingAddressId ? 'Update Address' : 'Save Address')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingAddressId(null);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(address => (
            <Card key={address.address_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gold" />
                    Address {address.address_id}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(address.address_id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address.address_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.state_province} {address.postal_code}</p>
                  <p>{address.country}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        address.address_type === 'shipping' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {address.address_type}
                      </span>
                      {address.is_default && (
                        <span className="px-2 py-1 text-xs rounded bg-gold text-white">
                          Default
                        </span>
                      )}
                    </div>
                    
                    {!address.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.address_id)}
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {addresses.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
              <p className="text-gray-600 mb-4">Add your first address to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddressManagement;
