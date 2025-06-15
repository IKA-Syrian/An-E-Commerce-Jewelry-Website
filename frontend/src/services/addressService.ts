import api from '../lib/api';

export interface Address {
  address_id: number;
  user_id: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  address_type: 'shipping' | 'billing';
  is_default: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressData {
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  address_type: 'shipping' | 'billing';
  is_default: boolean;
}

const addressService = {
  // Get all addresses for the authenticated user
  getUserAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/addresses');
    return response.data;
  },

  // Get a specific address by ID
  getAddressById: async (addressId: number): Promise<Address> => {
    const response = await api.get(`/addresses/${addressId}`);
    return response.data;
  },

  // Create a new address
  createAddress: async (addressData: CreateAddressData): Promise<Address> => {
    const response = await api.post('/addresses', addressData);
    return response.data;
  },

  // Update an existing address
  updateAddress: async (addressId: number, addressData: Partial<CreateAddressData>): Promise<{ message: string }> => {
    const response = await api.put(`/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Delete an address
  deleteAddress: async (addressId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/addresses/${addressId}`);
    return response.data;
  },

  // Set an address as default for its type
  setDefaultAddress: async (addressId: number): Promise<{ message: string }> => {
    const response = await api.put(`/addresses/${addressId}/set-default`);
    return response.data;
  },

  // Get default shipping address
  getDefaultShippingAddress: async (): Promise<Address | null> => {
    const addresses = await addressService.getUserAddresses();
    return addresses.find(address => address.address_type === 'shipping' && address.is_default) || null;
  },

  // Get default billing address
  getDefaultBillingAddress: async (): Promise<Address | null> => {
    const addresses = await addressService.getUserAddresses();
    return addresses.find(address => address.address_type === 'billing' && address.is_default) || null;
  }
};

export default addressService; 