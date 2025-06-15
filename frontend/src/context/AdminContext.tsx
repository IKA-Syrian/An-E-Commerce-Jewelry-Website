import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import adminService, { 
  AdminUser, 
  AdminLoginCredentials,
  AdminAuthResponse
} from '@/services/adminService';
import { verifyAdminAuth } from '@/lib/api';

interface AdminContextType {
  admin: AdminUser | null;
  loading: boolean;
  error: Error | null;
  login: (credentials: AdminLoginCredentials) => Promise<AdminAuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshAdminToken: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize admin from localStorage and verify token
  useEffect(() => {
    // First, check if we have both token and user data
    if (verifyAdminAuth()) {
      const storedAdmin = adminService.getCurrentAdmin();
      setAdmin(storedAdmin);
      console.log("Admin authenticated from stored credentials");
    } else {
      // If no valid admin auth, clear any potentially invalid data
      adminService.logout();
      setAdmin(null);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: AdminLoginCredentials): Promise<AdminAuthResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.login(credentials);
      
      // Double-check that token was properly stored
      if (!localStorage.getItem('adminJwt')) {
        console.error('Admin token not stored after login!');
        localStorage.setItem('adminJwt', response.token);
      }
      
      setAdmin(response.user);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to login as admin'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // First update the state
    setAdmin(null);
    
    // Then clear the tokens from localStorage
    adminService.logout();
    
    console.log('Admin logged out successfully');
  };
  
  // Function to refresh the admin token if needed
  const refreshAdminToken = () => {
    const token = localStorage.getItem('adminJwt');
    const adminUser = localStorage.getItem('adminUser');
    
    if (token && adminUser) {
      // If we have both, make sure admin state is set
      if (!admin) {
        try {
          const parsedAdmin = JSON.parse(adminUser);
          setAdmin(parsedAdmin);
          console.log('Admin token refreshed');
        } catch (e) {
          // If parsing fails, the stored data is invalid
          console.error('Failed to parse admin user data:', e);
          adminService.logout();
          setAdmin(null);
        }
      }
    } else {
      // If we're missing either, clear both
      adminService.logout();
      setAdmin(null);
    }
  };

  const value = { 
    admin, 
    loading, 
    error, 
    login, 
    logout,
    isAuthenticated: !!admin,
    refreshAdminToken
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
} 