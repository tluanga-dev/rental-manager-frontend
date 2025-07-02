'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { apiClient } from '@/lib/axios';
import { User, LoginResponse } from '@/types/auth';
import { Loader2, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login, setIsLoading } = useAuthStore();
  const { addNotification } = useAppStore();
  const [error, setError] = useState<string>('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);

    try {
      // Real API call to backend
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { user, accessToken, refreshToken } = response.data.data;
      
      // Update auth store
      login(user, accessToken, refreshToken);
      
      // Add success notification
      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${user.firstName}!`,
      });

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login functionality for development
  const handleDemoLogin = async (role: 'admin' | 'manager' | 'staff') => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers = {
      admin: {
        id: '1',
        email: 'admin@example.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: {
          id: '1',
          name: 'Administrator',
          description: 'Full system access',
          permissions: [
            { id: '1', code: 'SALE_CREATE', type: 'SALE_CREATE' as const, description: 'Create sales' },
            { id: '2', code: 'SALE_VIEW', type: 'SALE_VIEW' as const, description: 'View sales' },
            { id: '3', code: 'RENTAL_CREATE', type: 'RENTAL_CREATE' as const, description: 'Create rentals' },
            { id: '4', code: 'RENTAL_VIEW', type: 'RENTAL_VIEW' as const, description: 'View rentals' },
            { id: '5', code: 'CUSTOMER_CREATE', type: 'CUSTOMER_CREATE' as const, description: 'Create customers' },
            { id: '6', code: 'CUSTOMER_VIEW', type: 'CUSTOMER_VIEW' as const, description: 'View customers' },
            { id: '7', code: 'INVENTORY_VIEW', type: 'INVENTORY_VIEW' as const, description: 'View inventory' },
            { id: '8', code: 'REPORT_VIEW', type: 'REPORT_VIEW' as const, description: 'View reports' },
            { id: '9', code: 'SYSTEM_CONFIG', type: 'SYSTEM_CONFIG' as const, description: 'System configuration' },
          ],
        },
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      manager: {
        id: '2',
        email: 'manager@example.com',
        username: 'manager',
        firstName: 'Manager',
        lastName: 'User',
        role: {
          id: '2',
          name: 'Manager',
          description: 'Management access',
          permissions: [
            { id: '1', code: 'SALE_CREATE', type: 'SALE_CREATE' as const, description: 'Create sales' },
            { id: '2', code: 'SALE_VIEW', type: 'SALE_VIEW' as const, description: 'View sales' },
            { id: '3', code: 'RENTAL_CREATE', type: 'RENTAL_CREATE' as const, description: 'Create rentals' },
            { id: '4', code: 'RENTAL_VIEW', type: 'RENTAL_VIEW' as const, description: 'View rentals' },
            { id: '5', code: 'CUSTOMER_VIEW', type: 'CUSTOMER_VIEW' as const, description: 'View customers' },
            { id: '6', code: 'INVENTORY_VIEW', type: 'INVENTORY_VIEW' as const, description: 'View inventory' },
            { id: '7', code: 'REPORT_VIEW', type: 'REPORT_VIEW' as const, description: 'View reports' },
          ],
        },
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      staff: {
        id: '3',
        email: 'staff@example.com',
        username: 'staff',
        firstName: 'Staff',
        lastName: 'User',
        role: {
          id: '3',
          name: 'Staff',
          description: 'Basic access',
          permissions: [
            { id: '1', code: 'SALE_CREATE', type: 'SALE_CREATE' as const, description: 'Create sales' },
            { id: '2', code: 'SALE_VIEW', type: 'SALE_VIEW' as const, description: 'View sales' },
            { id: '3', code: 'RENTAL_VIEW', type: 'RENTAL_VIEW' as const, description: 'View rentals' },
            { id: '4', code: 'CUSTOMER_VIEW', type: 'CUSTOMER_VIEW' as const, description: 'View customers' },
            { id: '5', code: 'INVENTORY_VIEW', type: 'INVENTORY_VIEW' as const, description: 'View inventory' },
          ],
        },
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    };

    const user = mockUsers[role];
    const accessToken = 'demo-access-token';
    const refreshToken = 'demo-refresh-token';

    login(user, accessToken, refreshToken);
    
    addNotification({
      type: 'success',
      title: 'Demo Login Successful',
      message: `Logged in as ${user.role.name}`,
    });

    router.push('/dashboard');
    setIsLoading(false);
  };

  const isLoading = useAuthStore(state => state.isLoading);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login to Rental Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your email" 
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
                      type="password" 
                      placeholder="Enter your password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or try demo</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDemoLogin('admin')}
            disabled={isLoading}
          >
            Demo as Administrator
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDemoLogin('manager')}
            disabled={isLoading}
          >
            Demo as Manager
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleDemoLogin('staff')}
            disabled={isLoading}
          >
            Demo as Staff
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}