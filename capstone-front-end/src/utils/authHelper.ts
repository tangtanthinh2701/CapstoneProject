// Authentication and Role Management Helper

export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  userId: string;
  username: string;
  fullname: string;
  email: string;
  role: UserRole;
  token: string;
}

// Local Storage Keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'userId',
  USERNAME: 'username',
  FULLNAME: 'fullname',
  EMAIL: 'email',
  ROLE: 'role',
};

// Auth Helper Functions
export const authHelper = {
  // Save auth data to localStorage
  saveAuthData: (authData: AuthUser) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, authData.token);
    localStorage.setItem(STORAGE_KEYS.USER_ID, authData.userId);
    localStorage.setItem(STORAGE_KEYS.USERNAME, authData.username);
    localStorage.setItem(STORAGE_KEYS.FULLNAME, authData.fullname);
    localStorage.setItem(STORAGE_KEYS.EMAIL, authData.email);
    localStorage.setItem(STORAGE_KEYS.ROLE, authData.role);
  },

  // Get current auth data
  getAuthData: (): AuthUser | null => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;

    return {
      token,
      userId: localStorage.getItem(STORAGE_KEYS.USER_ID) || '',
      username: localStorage.getItem(STORAGE_KEYS.USERNAME) || '',
      fullname: localStorage.getItem(STORAGE_KEYS.FULLNAME) || '',
      email: localStorage.getItem(STORAGE_KEYS.EMAIL) || '',
      role: (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'USER',
    };
  },

  // Clear auth data (logout)
  clearAuthData: () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Get current user role
  getUserRole: (): UserRole | null => {
    return localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole;
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ROLE) === 'ADMIN';
  },

  // Check if user is regular user
  isUser: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ROLE) === 'USER';
  },

  // Get auth header for API requests
  getAuthHeader: () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Get user ID
  getUserId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
};

// Role-based Access Control
export const roleHelper = {
  // Check if user has required role
  hasRole: (requiredRole: UserRole): boolean => {
    const currentRole = authHelper.getUserRole();
    return currentRole === requiredRole;
  },

  // Check if user has any of the required roles
  hasAnyRole: (requiredRoles: UserRole[]): boolean => {
    const currentRole = authHelper.getUserRole();
    return currentRole ? requiredRoles.includes(currentRole) : false;
  },

  // Admin-only access features
  canManageUsers: () => authHelper.isAdmin(),
  canManageProjects: () => authHelper.isAdmin(),
  canManageFarms: () => authHelper.isAdmin(),
  canManageTreeSpecies: () => authHelper.isAdmin(),
  canManageTreeBatches: () => authHelper.isAdmin(),
  canApproveContracts: () => authHelper.isAdmin(),
  canApproveRenewals: () => authHelper.isAdmin(),
  canApproveTransfers: () => authHelper.isAdmin(),
  canIssueCredits: () => authHelper.isAdmin(),
  canVerifyCredits: () => authHelper.isAdmin(),
  canViewAllReports: () => authHelper.isAdmin(),
  canExportReports: () => authHelper.isAdmin(),
  canManagePayments: () => authHelper.isAdmin(),

  // User access features
  canCreateContract: () => authHelper.isAuthenticated(),
  canPurchaseCredits: () => authHelper.isAuthenticated(),
  canRetireCredits: () => authHelper.isAuthenticated(),
  canViewOwnDashboard: () => authHelper.isAuthenticated(),
  canUpdateOwnProfile: () => authHelper.isAuthenticated(),
  canViewPublicProjects: () => authHelper.isAuthenticated(),
};

// Navigation helper based on role
export const navigationHelper = {
  getDefaultRoute: (): string => {
    if (authHelper.isAdmin()) {
      return '/admin/dashboard';
    }
    return '/dashboard';
  },

  getAvailableRoutes: (): string[] => {
    if (authHelper.isAdmin()) {
      return [
        '/admin/dashboard',
        '/admin/users',
        '/admin/projects',
        '/admin/farms',
        '/admin/tree-species',
        '/admin/contracts',
        '/admin/carbon-credits',
        '/admin/payments',
        '/admin/reports',
      ];
    }
    return ['/dashboard', '/projects', '/contracts', '/carbon-credits', '/payments', '/profile'];
  },
};

export default authHelper;
