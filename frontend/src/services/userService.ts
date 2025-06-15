import api from '../lib/api';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const userService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/users/login', credentials);
    
    // Store the user data and token in localStorage
    if (response.data.user && response.data.token) {
      localStorage.setItem('jwt', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    // Convert password to password_hash as expected by the API
    const apiData = {
      ...userData,
      password_hash: userData.password
    };
    delete apiData.password;
    
    const response = await api.post('/users', apiData);
    
    // After registration, we need to log in to get a token
    if (response.data) {
      try {
        // Call login after successful registration
        const loginResponse = await userService.login({
          email: userData.email,
          password: userData.password
        });
        
        return loginResponse;
      } catch (loginError) {
        console.error('Auto-login after registration failed:', loginError);
        // Still return the registration data even if auto-login failed
        return {
          user: response.data,
          token: ''
        };
      }
    }
    
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('jwt');
  },

  getProfile: async (): Promise<User> => {
    try {
      // Try to get profile from API first
      const response = await api.get('/users/profile/me');
      
      // Update stored user data
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching profile from API:', error);
      
      // Fall back to stored user data
      const user = userService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      return user;
    }
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const response = await api.put(`/users/${currentUser.user_id}`, userData);
    
    // Update stored user data with the response from the server
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  }
};

export default userService; 