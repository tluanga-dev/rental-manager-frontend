'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { PermissionType } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: PermissionType | PermissionType[];
  requiredRole?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermissions,
  requiredRole,
  fallback
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Shield className="h-12 w-12 text-red-500" />
              <h2 className="text-lg font-semibold">Access Denied</h2>
              <Alert>
                <AlertDescription>
                  You need the role "{requiredRole}" to access this page.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermissions && !hasPermission(requiredPermissions)) {
    const permissionList = Array.isArray(requiredPermissions) 
      ? requiredPermissions.join(', ') 
      : requiredPermissions;

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Shield className="h-12 w-12 text-red-500" />
              <h2 className="text-lg font-semibold">Insufficient Permissions</h2>
              <Alert>
                <AlertDescription>
                  You need the following permission(s) to access this page: {permissionList}
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show fallback if provided and no access
  if (fallback && (requiredPermissions || requiredRole)) {
    return <>{fallback}</>;
  }

  // Render children if all checks pass
  return <>{children}</>;
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: PermissionType | PermissionType[],
  requiredRole?: string
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute 
        requiredPermissions={requiredPermissions}
        requiredRole={requiredRole}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking permissions in components
export function usePermissions() {
  const { hasPermission, hasRole, user } = useAuthStore();
  
  return {
    hasPermission,
    hasRole,
    user,
    can: (permission: PermissionType | PermissionType[]) => hasPermission(permission),
    is: (role: string) => hasRole(role),
  };
}