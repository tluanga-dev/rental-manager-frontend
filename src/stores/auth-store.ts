import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  AuthState, 
  PermissionType, 
  UserType, 
  USER_TYPE_HIERARCHY,
  canManageUserType 
} from '@/types/auth';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAuth: (accessToken: string) => void;
  hasPermission: (permission: PermissionType | PermissionType[]) => boolean;
  hasRole: (roleName: string) => boolean;
  hasUserType: (userType: UserType) => boolean;
  canManageUser: (targetUserType: UserType) => boolean;
  isSuperuser: () => boolean;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
  getEffectivePermissions: () => string[];
  updatePermissions: () => void;
  // Session management
  setSessionInfo: (sessionId: string, deviceId: string) => void;
  clearSession: () => void;
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
      sessionId: undefined,
      deviceId: undefined,

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
        // Get effective permissions from user object
        const permissions = user.effectivePermissions?.allPermissions || [];
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
          permissions: [],
          sessionId: undefined,
          deviceId: undefined,
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },

      refreshAuth: (accessToken) => {
        set({ accessToken });
        localStorage.setItem('accessToken', accessToken);
      },

      hasPermission: (permission) => {
        const { user, permissions } = get();
        
        // Superuser has all permissions
        if (user?.isSuperuser || user?.userType === 'SUPERADMIN') {
          return true;
        }
        
        if (Array.isArray(permission)) {
          return permission.some(p => permissions.includes(p));
        }
        return permissions.includes(permission);
      },

      hasRole: (roleName) => {
        const { user } = get();
        return user?.role?.name === roleName;
      },

      hasUserType: (userType) => {
        const { user } = get();
        return user?.userType === userType;
      },

      canManageUser: (targetUserType) => {
        const { user } = get();
        if (!user) return false;
        return canManageUserType(user.userType, targetUserType);
      },

      isSuperuser: () => {
        const { user } = get();
        return user?.isSuperuser === true || user?.userType === 'SUPERADMIN';
      },

      isAdmin: () => {
        const { user } = get();
        return user?.userType === 'SUPERADMIN' || user?.userType === 'ADMIN';
      },

      isCustomer: () => {
        const { user } = get();
        return user?.userType === 'CUSTOMER';
      },

      getEffectivePermissions: () => {
        const { user, permissions } = get();
        if (!user) return [];
        
        // Superuser gets all permissions conceptually
        if (user.isSuperuser || user.userType === 'SUPERADMIN') {
          return permissions; // In practice, we still use the stored permissions
        }
        
        return permissions;
      },

      updatePermissions: () => {
        const { user } = get();
        if (user) {
          // Use effective permissions from user object
          const permissions = user.effectivePermissions?.allPermissions || [];
          set({ permissions });
        }
      },

      setSessionInfo: (sessionId, deviceId) => {
        set({ sessionId, deviceId });
      },

      clearSession: () => {
        set({ sessionId: undefined, deviceId: undefined });
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
        sessionId: state.sessionId,
        deviceId: state.deviceId,
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