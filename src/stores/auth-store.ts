import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState, PermissionType } from '@/types/auth';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAuth: (accessToken: string) => void;
  hasPermission: (permission: PermissionType | PermissionType[]) => boolean;
  hasRole: (roleName: string) => boolean;
  updatePermissions: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // Start as true, will be set to false after hydration
      permissions: [],

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          get().updatePermissions();
        }
      },

      setTokens: (accessToken, refreshToken) => 
        set({ accessToken, refreshToken }),

      setIsLoading: (isLoading) => set({ isLoading }),

      login: (user, accessToken, refreshToken) => {
        const permissions = user.role?.permissions?.map(p => p.code) || [];
        set({ 
          user, 
          accessToken, 
          refreshToken, 
          isAuthenticated: true, 
          isLoading: false,
          permissions 
        });
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },

      logout: () => {
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false, 
          isLoading: false,
          permissions: []
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },

      refreshAuth: (accessToken) => {
        set({ accessToken });
        localStorage.setItem('accessToken', accessToken);
      },

      hasPermission: (permission) => {
        const { permissions } = get();
        if (Array.isArray(permission)) {
          return permission.some(p => permissions.includes(p));
        }
        return permissions.includes(permission);
      },

      hasRole: (roleName) => {
        const { user } = get();
        return user?.role?.name === roleName;
      },

      updatePermissions: () => {
        const { user } = get();
        if (user && user.role) {
          const permissions = user.role.permissions?.map(p => p.code) || [];
          set({ permissions });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        // Set loading to false after hydration completes
        if (state) {
          state.setIsLoading(false);
        }
      },
    }
  )
);