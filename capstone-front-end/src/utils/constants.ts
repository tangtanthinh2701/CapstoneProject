// ==================== API CONSTANTS ====================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    DASHBOARD: '/user/dashboard',
    CONTRACTS: '/user/contracts',
    ALLOCATIONS: '/user/allocations',
    TRANSACTIONS: '/user/transactions',
    CHANGE_PASSWORD: '/user/change-password',
  },

  // Admin
  ADMIN: {
    USERS: '/admin/users',
    STATISTICS: '/admin/statistics',
    PENDING_APPROVALS: '/admin/pending-approvals',
  },

  // Projects
  PROJECTS: '/projects',

  // Farms
  FARMS: '/farms',

  // Tree Species
  TREE_SPECIES: '/tree-species',

  // Tree Batches
  TREE_BATCHES: '/tree-batches',

  // Tree Growth Records
  TREE_GROWTH_RECORDS: '/tree-growth-records',

  // Contracts
  CONTRACTS: '/contracts',
  CONTRACT_TRANSFERS: '/contract-transfers',

  // Carbon Credits
  CARBON_CREDITS: '/carbon-credits',

  // Payments
  PAYMENTS: '/payments',
  VNPAY: '/payments/vnpay',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Chat
  CHAT: '/chat',

  // Dashboard & Reports
  DASHBOARD: '/dashboard',
  REPORTS: '/reports',

  // Environment Factors
  ENVIRONMENT_FACTORS: '/environment-factors',

  // Partners
  PARTNERS: '/partners',
  PROJECT_PARTNERS: '/project-partners',
} as const;

// ==================== STATUS CONSTANTS ====================

export const CONTRACT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  TERMINATED: 'TERMINATED',
  RENEWED: 'RENEWED',
} as const;

export const CONTRACT_TYPE = {
  OWNERSHIP: 'OWNERSHIP',
  PARTNERSHIP: 'PARTNERSHIP',
  INVESTMENT: 'INVESTMENT',
  SERVICE: 'SERVICE',
} as const;

export const PROJECT_STATUS = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED',
} as const;

export const CREDIT_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  ISSUED: 'ISSUED',
  SOLD: 'SOLD',
  RETIRED: 'RETIRED',
  CANCELLED: 'CANCELLED',
} as const;

export const HEALTH_STATUS = {
  HEALTHY: 'HEALTHY',
  STRESSED: 'STRESSED',
  DISEASED: 'DISEASED',
  DEAD: 'DEAD',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

// ==================== UI CONSTANTS ====================

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_TIME: 'YYYY-MM-DDTHH:mm:ss',
} as const;

// ==================== ROLE CONSTANTS ====================

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;

// ==================== VERIFICATION STANDARDS ====================

export const VERIFICATION_STANDARDS = {
  VCS: 'VCS',
  GOLD_STANDARD: 'GOLD_STANDARD',
  CDM: 'CDM',
  PLAN_VIVO: 'PLAN_VIVO',
  OTHER: 'OTHER',
} as const;

// ==================== COLOR MAPPINGS ====================

export const STATUS_COLORS: Record<string, string> = {
  // Green variants
  ACTIVE: '#22c55e',
  HEALTHY: '#22c55e',
  VERIFIED: '#22c55e',
  APPROVED: '#22c55e',
  COMPLETED: '#22c55e',

  // Yellow variants
  PENDING: '#eab308',
  STRESSED: '#eab308',

  // Red variants
  EXPIRED: '#ef4444',
  TERMINATED: '#ef4444',
  DISEASED: '#ef4444',
  REJECTED: '#ef4444',
  FAILED: '#ef4444',

  // Blue variants
  RENEWED: '#3b82f6',
  ISSUED: '#3b82f6',
  PLANNING: '#3b82f6',

  // Purple variants
  SOLD: '#a855f7',

  // Orange variants
  RETIRED: '#f97316',

  // Gray variants
  DRAFT: '#6b7280',
  DEAD: '#6b7280',
  CANCELLED: '#6b7280',
};

// ==================== CHART COLORS ====================

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#eab308',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  PURPLE: '#a855f7',
  ORANGE: '#f97316',
  GRAY: '#6b7280',

  // Gradients
  PRIMARY_GRADIENT: ['#3b82f6', '#60a5fa'],
  SUCCESS_GRADIENT: ['#22c55e', '#4ade80'],
  WARNING_GRADIENT: ['#eab308', '#facc15'],
  DANGER_GRADIENT: ['#ef4444', '#f87171'],
} as const;
