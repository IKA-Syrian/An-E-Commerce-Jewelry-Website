import { useState, useEffect, useCallback } from 'react';
import userService, { 
  User, 
  LoginCredentials, 
  RegisterData 
} from '../services/userService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = userService.getCurrentUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to login'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.register(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to register'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    userService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    user, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    updateProfile,
    isAuthenticated: !!user
  };
} 