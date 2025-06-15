import { useState, useEffect, useCallback } from 'react';
import addressService, { Address } from '@/services/addressService';
import { useAuthContext } from '@/context/AuthContext';

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthContext();

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await addressService.getUserAddresses();
      setAddresses(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to load your addresses. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch addresses when component mounts or auth state changes
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (addressData: any) => {
    try {
      const newAddress = await addressService.createAddress(addressData);
      setAddresses(prev => [...prev, newAddress]);
      return newAddress;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  };

  const updateAddress = async (addressId: number, addressData: any) => {
    try {
      await addressService.updateAddress(addressId, addressData);
      // Refresh the addresses to get the updated data
      await fetchAddresses();
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  const deleteAddress = async (addressId: number) => {
    try {
      await addressService.deleteAddress(addressId);
      setAddresses(prev => prev.filter(addr => addr.address_id !== addressId));
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  };

  const setDefaultAddress = async (addressId: number) => {
    try {
      await addressService.setDefaultAddress(addressId);
      await fetchAddresses(); // Refresh to get updated default status
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  };

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };
} 