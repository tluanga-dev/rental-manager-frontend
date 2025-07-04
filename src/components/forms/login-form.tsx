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
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const responseData = response.data.data || response.data;
      const { user, access_token, refresh_token } = responseData;
      
      // Update auth store
      login(user, access_token, refresh_token);
      
      // Add success notification
      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${user.first_name || user.name}!`,
      });

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error: unknown) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { detail?: string; message?: string } } };
        errorMessage = apiError.response?.data?.detail || apiError.response?.data?.message || errorMessage;
      }
      
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
    console.log('Demo login attempt for role:', role);
    setIsLoading(true);
    setError('');
    
    try {
      const credentials = {
        admin: { email: 'admin@example.com', password: 'admin123' },
        manager: { email: 'manager@example.com', password: 'manager123' },
        staff: { email: 'staff@example.com', password: 'staff123' },
      };

      const { email, password } = credentials[role];
      
      console.log('Making API call to:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/login`);
      console.log('With credentials:', { email, password: '***' });
      
      // Use real API call
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      console.log('API response:', response.data);

      const responseData = response.data.data || response.data;
      const { user, access_token, refresh_token } = responseData;
      
      // Update auth store
      login(user, access_token, refresh_token);
      
      addNotification({
        type: 'success',
        title: 'Demo Login Successful',
        message: `Logged in as ${user.role?.name || 'Admin'}`,
      });

      router.push('/dashboard');
      
    } catch (error: unknown) {
      console.error('Demo login failed:', error);
      
      let errorMessage = 'Demo login failed. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { detail?: string; message?: string } } };
        errorMessage = apiError.response?.data?.detail || apiError.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      
      addNotification({
        type: 'error',
        title: 'Demo Login Failed',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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