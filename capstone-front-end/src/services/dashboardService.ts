import { apiClient, type ApiResponse } from '../utils/api';
import type {
  DashboardSummary,
  ProjectDashboard,
  UserDashboard,
  CO2MonthlyData,
  RevenueMonthlyData,
  TopProject,
} from '../models/dashboard.model';

const BASE_PATH = '/dashboard';

export const dashboardService = {
  // ==================== ADMIN DASHBOARD ====================

  async getAdminSummary(): Promise<ApiResponse<DashboardSummary>> {
    return apiClient.get<DashboardSummary>(`${BASE_PATH}/admin/summary`);
  },

  async getCO2Monthly(year: number): Promise<ApiResponse<CO2MonthlyData[]>> {
    return apiClient.get<CO2MonthlyData[]>(`${BASE_PATH}/admin/co2-monthly`, {
      year,
    });
  },

  async getRevenueMonthly(year: number): Promise<ApiResponse<RevenueMonthlyData[]>> {
    return apiClient.get<RevenueMonthlyData[]>(`${BASE_PATH}/admin/revenue-monthly`, { year });
  },

  async getTopProjects(limit = 10): Promise<ApiResponse<TopProject[]>> {
    return apiClient.get<TopProject[]>(`${BASE_PATH}/admin/top-projects`, {
      limit,
    });
  },

  // ==================== PROJECT DASHBOARD ====================

  async getProjectDashboard(projectId: number): Promise<ApiResponse<ProjectDashboard>> {
    return apiClient.get<ProjectDashboard>(`${BASE_PATH}/project/${projectId}`);
  },

  // ==================== USER DASHBOARD ====================

  async getMyDashboard(): Promise<ApiResponse<UserDashboard>> {
    return apiClient.get<UserDashboard>(`${BASE_PATH}/my-dashboard`);
  },
};

export default dashboardService;
