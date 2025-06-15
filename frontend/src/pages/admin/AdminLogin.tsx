import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useAdminContext } from '@/context/AdminContext';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { verifyAdminAuth } from '@/lib/api';

interface LoginForm {
  email: string;
  password: string;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminContext();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Redirect to admin dashboard if already authenticated
  useEffect(() => {
    // Check if admin is already authenticated
    const checkAuth = () => {
      if (isAuthenticated || verifyAdminAuth()) {
        navigate('/admin/dashboard', { replace: true });
      }
    };
    
    checkAuth();
  }, [isAuthenticated, navigate]);
  
  const form = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login({
        email: data.email,
        password: data.password
      });
      
      // Show success toast
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel",
        variant: "default"
      });
      
      // Navigate to admin dashboard on successful login
      // Use replace to prevent going back to login page with browser back button
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      console.error('Admin login failed:', error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Access the Golden House admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email / Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="admin@example.com" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your password" 
                        type="password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? <><Spinner size="sm" className="mr-2" /> Signing in...</> : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
