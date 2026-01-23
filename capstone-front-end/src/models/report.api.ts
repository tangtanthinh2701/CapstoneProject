import axios from 'axios';

const API_BASE_URL = 'http://localhost:8088/api';

// ==================== TYPES ====================

export interface CO2Report {
  year: number;
  totalCO2Kg: number;
  totalCO2Tons: number;
  monthlyBreakdown: MonthlyData[];
  projectBreakdown: ProjectData[];
  trendPercentage: number;
}

export interface MonthlyData {
  month: number;
  co2Kg: number;
  growthRate?: number;
}

export interface ProjectData {
  projectId: number;
  projectName: string;
  co2Kg: number;
  percentage: number;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ==================== APIs ====================

export const getCO2Report = (year: number) =>
  axios.get<CO2Report>(`${API_BASE_URL}/reports/co2`, {
    params: { year },
    headers: getAuthHeader(),
  });

export const getProjectCO2Report = (projectId: number, year: number) =>
  axios.get<CO2Report>(`${API_BASE_URL}/reports/projects/${projectId}/co2`, {
    params: { year },
    headers: getAuthHeader(),
  });

export const exportCO2Excel = (year: number) =>
  axios.get(`${API_BASE_URL}/reports/co2/export/excel`, {
    params: { year },
    headers: getAuthHeader(),
    responseType: 'blob',
  });

export const exportCO2Pdf = (year: number) =>
  axios.get(`${API_BASE_URL}/reports/co2/export/pdf`, {
    params: { year },
    headers: getAuthHeader(),
    responseType: 'blob',
  });

export const reportApi = {
  getCO2Report,
  getProjectCO2Report,
  exportCO2Excel,
  exportCO2Pdf,
};
