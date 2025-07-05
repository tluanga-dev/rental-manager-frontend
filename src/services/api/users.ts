/**
 * User management API service
 */

import { api } from '@/lib/axios';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserSession,
  DirectPermissionGrant,
  AuditLog,
  AuditLogFilter
} from '@/types/auth';

export const usersApi = {
  // User CRUD operations
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
    isActive?: boolean;
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(id: string, userData: Partial<UpdateUserRequest>): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async activateUser(id: string): Promise<User> {
    const response = await api.post(`/users/${id}/activate`);
    return response.data;
  },

  async deactivateUser(id: string): Promise<User> {
    const response = await api.post(`/users/${id}/deactivate`);
    return response.data;
  },

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { password: newPassword });
  },

  // User type management
  async updateUserType(id: string, userType: string): Promise<User> {
    const response = await api.put(`/users/${id}/user-type`, { userType });
    return response.data;
  },

  // Role assignment
  async assignRole(userId: string, roleId: string, reason?: string): Promise<User> {
    const response = await api.post(`/users/${userId}/roles/${roleId}`, { reason });
    return response.data;
  },

  async unassignRole(userId: string, reason?: string): Promise<User> {
    const response = await api.delete(`/users/${userId}/role`, { data: { reason } });
    return response.data;
  },

  // Direct permission management
  async getUserDirectPermissions(userId: string): Promise<DirectPermissionGrant[]> {
    const response = await api.get(`/users/${userId}/permissions`);
    return response.data;
  },

  async grantDirectPermission(
    userId: string, 
    permissionCode: string, 
    reason?: string,
    expiresAt?: string
  ): Promise<DirectPermissionGrant> {
    const response = await api.post(`/users/${userId}/permissions`, {
      permissionCode,
      reason,
      expiresAt,
    });
    return response.data;
  },

  async revokeDirectPermission(userId: string, permissionCode: string, reason?: string): Promise<void> {
    await api.delete(`/users/${userId}/permissions/${permissionCode}`, {
      data: { reason }
    });
  },

  // User sessions
  async getUserSessions(userId: string): Promise<UserSession[]> {
    const response = await api.get(`/users/${userId}/sessions`);
    return response.data;
  },

  async terminateUserSession(userId: string, sessionId: string): Promise<void> {
    await api.delete(`/users/${userId}/sessions/${sessionId}`);
  },

  async terminateAllUserSessions(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/sessions`);
  },

  // User impersonation (admin only)
  async impersonateUser(userId: string, reason?: string): Promise<{ accessToken: string; user: User }> {
    const response = await api.post(`/users/${userId}/impersonate`, { reason });
    return response.data;
  },

  async stopImpersonation(): Promise<{ accessToken: string; user: User }> {
    const response = await api.post('/auth/stop-impersonation');
    return response.data;
  },

  // User statistics and analytics
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByType: Record<string, number>;
    newUsersThisMonth: number;
    lastLoginStats: Array<{ date: string; count: number }>;
  }> {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Bulk operations
  async bulkUpdateUsers(userIds: string[], updates: Partial<UpdateUserRequest>): Promise<User[]> {
    const response = await api.put('/users/bulk', { userIds, updates });
    return response.data;
  },

  async bulkActivateUsers(userIds: string[]): Promise<User[]> {
    const response = await api.post('/users/bulk/activate', { userIds });
    return response.data;
  },

  async bulkDeactivateUsers(userIds: string[]): Promise<User[]> {
    const response = await api.post('/users/bulk/deactivate', { userIds });
    return response.data;
  },

  // User audit logs
  async getUserAuditLogs(userId: string, filters?: AuditLogFilter): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await api.get(`/users/${userId}/audit-logs`, { params: filters });
    return response.data;
  },

  // User permissions validation
  async validateUserPermissions(userId: string): Promise<{
    isValid: boolean;
    conflicts: Array<{ permission: string; source: string; conflict: string }>;
    suggestions: Array<{ action: string; reason: string }>;
  }> {
    const response = await api.get(`/users/${userId}/validate-permissions`);
    return response.data;
  },

  // User effective permissions
  async getUserEffectivePermissions(userId: string): Promise<{
    userType: string;
    isSuperuser: boolean;
    rolePermissions: string[];
    directPermissions: string[];
    allPermissions: string[];
    inheritedPermissions: string[];
  }> {
    const response = await api.get(`/users/${userId}/effective-permissions`);
    return response.data;
  },
};

export default usersApi;