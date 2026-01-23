import api from '../utils/api';

// ========================
// DASHBOARD SUMMARY
// ========================
export interface DashboardSummary {
  // Project stats
  totalProjects: number;
  activeProjects: number;

  // Farm stats
  totalFarms: number;
  activeFarms: number;

  // Tree stats
  totalTrees: number;
  aliveTrees: number;

  // Carbon stats
  totalCarbonCredits: number;
  totalCo2AbsorbedTons: number;
  targetCo2: number;
  co2CompletionPercentage: number;

  // Credit stats
  totalCreditsIssued: number;
  totalCreditsSold: number;
  totalCreditsAvailable: number;
  totalCreditsRetired: number;

  // Contract stats
  totalContracts: number;
  activeContracts: number;
  expiringSoonContracts: number;
  totalContractValue: number;

  // Revenue
  totalRevenue: number;

  // Recent activities
  recentActivities: RecentActivity[];

  // Embedded chart data (optional)
  monthlyCo2Data?: MonthlyData[];
  monthlyRevenueData?: MonthlyRevenueData[];
  topProjectsByCo2?: TopProject[];
}

export interface RecentActivity {
  activityType: 'CONTRACT' | 'CREDIT' | 'PAYMENT';
  description: string;
  referenceId: number;
  referenceCode: string;
  timestamp: string;
}

// ========================
// CHART DATA
// ========================
export interface MonthlyData {
  month: number;
  monthName: string;
  year: number;
  value: number;
}

export interface MonthlyRevenueData {
  month: number;
  monthName: string;
  year: number;
  value: number;
  revenue: number;
  count: number;
}

export interface TopProject {
  projectId: number;
  projectCode: string;
  projectName: string;
  id: number;
  name: string;
  co2Absorbed: number;
  totalCo2Absorbed: number;
  completionPercentage: number;
}

// ========================
// API FUNCTIONS
// ========================
export const getDashboardSummary = () => api.get<DashboardSummary>('/dashboard/admin/summary');

export const getMonthlyCo2Data = (year: number) => api.get<MonthlyData[]>('/reports/co2/monthly', { params: { year } });
export const getMonthlyRevenueData = (year: number) => api.get<MonthlyRevenueData[]>('/reports/revenue/monthly', { params: { year } });
export const getTopProjects = (limit: number) => api.get<TopProject[]>('/projects/top', { params: { limit } });

// Export functions
export const exportCo2Excel = (year: number) => api.get('/reports/co2/export/excel', { params: { startDate: `${year}-01-01`, endDate: `${year}-12-31` }, responseType: 'blob' });
export const exportRevenueExcel = (year: number) => api.get('/reports/revenue/export/excel', { params: { year }, responseType: 'blob' });
export const exportCreditsExcel = (year: number) => api.get('/reports/credits/export/excel', { params: { year }, responseType: 'blob' });

export const exportCo2Pdf = (year: number) => api.get('/reports/co2/export/pdf', { params: { year }, responseType: 'blob' });
export const exportRevenuePdf = (year: number) => api.get('/reports/revenue/export/pdf', { params: { year }, responseType: 'blob' });
export const exportCreditsPdf = (year: number) => api.get('/reports/credits/export/pdf', { params: { year }, responseType: 'blob' });

// Utility function
export const downloadBlob = (blob: any, filename: string) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};
