import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import api from '@/lib/api';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface Address {
  address_id: number;
  user_id: number;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>(0);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    notes: ''
  });

  // Fetch user's saved addresses if logged in
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user && user.user_id) {
        try {
          setAddressesLoading(true);
          const response = await api.get('/addresses');
          if (response.data && Array.isArray(response.data)) {
            setSavedAddresses(response.data);
            // Set default address if available
            const defaultAddress = response.data.find(addr => addr.is_default);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.address_id);
            } else if (response.data.length > 0) {
              setSelectedAddressId(response.data[0].address_id);
            } else {
              setSelectedAddressId('new');
            }
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setSelectedAddressId('new');
        } finally {
          setAddressesLoading(false);
        }
      } else {
        setSelectedAddressId('new');
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  // Fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Load PayPal script
  useEffect(() => {
    if (!document.querySelector('script[src*="paypal.com/sdk/js"]')) {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=AU_FeroH67if6SMyK6ZWfLa1iPzDyCmTo7NFw85h0NkqxnzqO487zgdYXfdsB9ftZjXfko2gjIBhNzl4&currency=USD";
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else {
      setPaypalLoaded(true);
    }
  }, []);

  // Render PayPal buttons once when paypalLoaded becomes true
  useEffect(() => {
    // Clear any existing buttons first
    if (paypalButtonRef.current) {
      paypalButtonRef.current.innerHTML = '';
    }
    
    if (paypalLoaded && window.paypal && paypalButtonRef.current) {
      window.paypal
        .Buttons({
          // Disable the button until addresses are loaded
          onInit: function(data, actions) {
            if (addressesLoading || !isValidForm()) {
              actions.disable();
            }
          },
          onClick: function(data, actions) {
            // Validate form before allowing payment
            if (!isValidForm()) {
              toast({
                title: "Please fill all required fields",
                description: "All shipping information fields are required.",
                variant: "destructive"
              });
              return actions.reject();
            }
            return actions.resolve();
          },
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: cartTotal.toFixed(2),
                    currency_code: 'USD'
                  },
                  description: `Golden House Jewelry Order`
                }
              ]
            });
          },
          onApprove: async (data, actions) => {
            try {
              setIsLoading(true);
              
              // Capture the funds from the transaction
              const details = await actions.order.capture();

              // Create order in the database
              const orderItems = cartItems.map(item => ({
                product_id: item.product.product_id,
                quantity: item.quantity,
                price: item.product.base_price
              }));

              // Get shipping address data
              let shippingAddressData;
              if (selectedAddressId === 'new') {
                // Creating a new address
                shippingAddressData = {
                  full_name: `${formData.firstName} ${formData.lastName}`,
                  address_line1: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.zipCode,
                  country: formData.country,
                  phone: formData.phone
                };
              } else {
                // Using an existing address ID
                // Verify this address belongs to the current user
                const addressBelongsToUser = savedAddresses.some(addr => addr.address_id === selectedAddressId);
                if (!addressBelongsToUser) {
                  throw new Error('The selected address does not belong to your account');
                }
                shippingAddressData = { address_id: selectedAddressId };
              }

              const order = {
                shipping_address: shippingAddressData,
                billing_address: shippingAddressData, // Use same address for billing
                email: formData.email,
                notes: formData.notes,
                items: orderItems,
                total_amount: cartTotal,
                payment: {
                  amount: cartTotal,
                  payment_method: 'PayPal',
                  transaction_id: details.id,
                  status: 'succeeded',
                  gateway_response: JSON.stringify(details)
                }
              };

              // Submit the order to your backend
              const response = await api.post('/orders', order);
              
              // Clear the cart after successful order
              clearCart();
              
              // Redirect to success page
              navigate(`/order-success/${response.data.order_id}`);
              
              toast({
                title: "Payment Successful",
                description: "Your order has been placed successfully!",
              });
            } catch (error) {
              console.error('Order processing error:', error);
              toast({
                title: "Error Processing Order",
                description: "There was a problem processing your order. Please try again.",
                variant: "destructive"
              });
            } finally {
              setIsLoading(false);
            }
          },
          onError: (err) => {
            console.error('PayPal Error:', err);
            toast({
              title: "Payment Error",
              description: "There was an error processing your payment. Please try again.",
              variant: "destructive"
            });
          }
        })
        .render(paypalButtonRef.current);
    }
  }, [paypalLoaded, addressesLoading]);

  const isValidForm = () => {
    if (selectedAddressId !== 'new') {
      // If using saved address, we just need email
      return !!formData.email;
    }
    
    // If using new address, validate all fields
    return (
      !!formData.firstName &&
      !!formData.lastName &&
      !!formData.email &&
      !!formData.address &&
      !!formData.city &&
      !!formData.state &&
      !!formData.zipCode &&
      !!formData.country &&
      !!formData.phone
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAddressSelect = (value: string) => {
    setSelectedAddressId(value === 'new' ? 'new' : parseInt(value));
    
    // If selecting a saved address, populate the form with that address data
    if (value !== 'new') {
      const selectedAddress = savedAddresses.find(addr => addr.address_id === parseInt(value));
      if (selectedAddress) {
        const nameParts = selectedAddress.full_name ? selectedAddress.full_name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setFormData(prev => ({
          ...prev,
          firstName,
          lastName,
          address: selectedAddress.address_line1,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.postal_code,
          country: selectedAddress.country,
          phone: selectedAddress.phone
        }));
      }
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-playfair text-3xl font-bold mb-8 text-center">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="font-playfair text-xl font-bold mb-4">Shipping Information</h2>
            
            {addressesLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              </div>
            ) : (
              <>
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Select Shipping Address</h3>
                    <RadioGroup
                      value={selectedAddressId.toString()}
                      onValueChange={handleAddressSelect}
                      className="space-y-3"
                    >
                      {savedAddresses.map(address => (
                        <div key={address.address_id} className="flex items-start space-x-2 border p-3 rounded-md">
                          <RadioGroupItem value={address.address_id.toString()} id={`address-${address.address_id}`} />
                          <div className="grid gap-1">
                            <Label htmlFor={`address-${address.address_id}`} className="font-medium">
                              {address.full_name} {address.is_default && <span className="text-sm text-green-600">(Default)</span>}
                            </Label>
                            <div className="text-sm text-gray-600">
                              <p>{address.address_line1}</p>
                              {address.address_line2 && <p>{address.address_line2}</p>}
                              <p>{address.city}, {address.state} {address.postal_code}</p>
                              <p>{address.country}</p>
                              <p>{address.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-start space-x-2 border p-3 rounded-md">
                        <RadioGroupItem value="new" id="address-new" />
                        <Label htmlFor="address-new" className="font-medium">
                          Use a new address
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name*</label>
                        <Input id="firstName" value={formData.firstName} onChange={handleChange} required />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name*</label>
                        <Input id="lastName" value={formData.lastName} onChange={handleChange} required />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email*</label>
                      <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="address" className="block text-sm font-medium mb-1">Address*</label>
                      <Input id="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium mb-1">City*</label>
                        <Input id="city" value={formData.city} onChange={handleChange} required />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium mb-1">State/Province*</label>
                        <Input id="state" value={formData.state} onChange={handleChange} required />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium mb-1">ZIP/Postal Code*</label>
                        <Input id="zipCode" value={formData.zipCode} onChange={handleChange} required />
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium mb-1">Country*</label>
                        <Input id="country" value={formData.country} onChange={handleChange} required />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number*</label>
                      <Input id="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                  </>
                )}
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-1">Order Notes (Optional)</label>
                  <Textarea id="notes" value={formData.notes} onChange={handleChange} placeholder="Special instructions for your order" />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="font-playfair text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.product.product_id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.product.base_price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-playfair text-xl font-bold mb-4">Payment Method</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                All transactions are secure and encrypted. Credit card information is never stored.
              </p>
              
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                </div>
              ) : (
                <div ref={paypalButtonRef} className="mt-4"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 