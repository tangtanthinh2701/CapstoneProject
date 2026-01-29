import { apiClient, type ApiResponse } from '../utils/api';
import type {
  DashboardSummary,
  ProjectDashboard,
  UserDashboard,
  CO2Report,
  RevenueReport,
  CreditReport,
} from '../models/dashboard.model';

export const reportService = {
  // ==================== DASHBOARD ====================

  async getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
    return apiClient.get<DashboardSummary>('/dashboard/summary');
  },

  async getProjectDashboard(projectId: number): Promise<ApiResponse<ProjectDashboard>> {
    return apiClient.get<ProjectDashboard>(`/dashboard/project/${projectId}`);
  },

  async getUserDashboard(): Promise<ApiResponse<UserDashboard>> {
    return apiClient.get<UserDashboard>('/user/dashboard');
  },

  // ==================== CO2 REPORTS ====================

  async getCO2Report(year?: number): Promise<ApiResponse<CO2Report>> {
    return apiClient.get<CO2Report>('/reports/co2', { year });
  },

  async getCO2ReportByProject(projectId: number, year?: number): Promise<ApiResponse<CO2Report>> {
    return apiClient.get<CO2Report>(`/reports/co2/project/${projectId}`, {
      year,
    });
  },

  async getCO2ReportByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<CO2Report>> {
    return apiClient.get<CO2Report>('/reports/co2/range', {
      startDate,
      endDate,
    });
  },

  // ==================== REVENUE REPORTS ====================

  async getRevenueReport(year?: number): Promise<ApiResponse<RevenueReport>> {
    return apiClient.get<RevenueReport>('/reports/revenue', { year });
  },

  async getRevenueReportByProject(
    projectId: number,
    year?: number,
  ): Promise<ApiResponse<RevenueReport>> {
    return apiClient.get<RevenueReport>(`/reports/revenue/project/${projectId}`, { year });
  },

  async getRevenueReportByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<RevenueReport>> {
    return apiClient.get<RevenueReport>('/reports/revenue/range', {
      startDate,
      endDate,
    });
  },

  // ==================== CREDIT REPORTS ====================

  async getCreditReport(year?: number): Promise<ApiResponse<CreditReport>> {
    return apiClient.get<CreditReport>('/reports/credits', { year });
  },

  async getCreditReportByProject(
    projectId: number,
    year?: number,
  ): Promise<ApiResponse<CreditReport>> {
    return apiClient.get<CreditReport>(`/reports/credits/project/${projectId}`, { year });
  },

  // ==================== EXPORT REPORTS ====================

  async exportReportExcel(type: 'CO2' | 'REVENUE' | 'CREDITS', year?: number): Promise<Blob> {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const params = new URLSearchParams();
    params.append('type', type);
    if (year) params.append('year', year.toString());

    const response = await fetch(`${API_BASE_URL}/reports/export/excel?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export report');
    }

    return response.blob();
  },

  async exportReportPDF(type: 'CO2' | 'REVENUE' | 'CREDITS', year?: number): Promise<Blob> {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const params = new URLSearchParams();
    params.append('type', type);
    if (year) params.append('year', year.toString());

    const response = await fetch(`${API_BASE_URL}/reports/export/pdf?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export report');
    }

    return response.blob();
  },

  // ==================== ADMIN STATISTICS ====================

  async getAdminStatistics(): Promise<ApiResponse<DashboardSummary>> {
    return apiClient.get<DashboardSummary>('/admin/statistics');
  },

  async getPendingApprovals(): Promise<
    ApiResponse<{
      contracts: number;
      renewals: number;
      transfers: number;
      total: number;
    }>
  > {
    return apiClient.get('/admin/pending-approvals');
  },
};

export default reportService;
