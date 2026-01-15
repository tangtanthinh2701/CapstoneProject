// ==================== TYPES ====================
export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalFarms: number;
  activeFarms: number;
  totalTrees: number;
  aliveTrees: number;
  totalCo2Absorbed: number;
  totalCo2AbsorbedTons: number;
  targetCo2: number;
  co2CompletionPercentage: number;
  totalCreditsIssued: number;
  totalCreditsSold: number;
  totalCreditsRetired: number;
  totalCreditsAvailable: number;
  totalRevenue: number;
  totalContractValue: number;
  averageCreditPrice: number;
  totalContracts: number;
  activeContracts: number;
  expiringSoonContracts: number;
  totalOwnerships: number;
  activeOwnerships: number;
  recentActivities: RecentActivity[];
  monthlyCo2Data: MonthlyData[];
  monthlyRevenueData: MonthlyRevenueData[];
  topProjectsByCo2: TopProject[];
}

export interface RecentActivity {
  activityType: 'CONTRACT' | 'CREDIT' | 'OWNERSHIP' | 'TRANSACTION';
  description: string;
  referenceCode: string;
  referenceId: number;
  timestamp: string;
}

export interface MonthlyData {
  year: number;
  month: number;
  monthName: string;
  value: number;
  count: number | null;
}

export interface MonthlyRevenueData {
  year: number;
  month: number;
  monthName: string;
  value: number;
  count: number;
}

export interface TopProject {
  projectId: number;
  projectCode: string;
  projectName: string;
  totalCo2Absorbed: number;
  targetCo2: number;
  completionPercentage: number;
  totalTrees: number;
  totalCreditsIssued: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  timestamp: string;
  pageInfo: any;
}

// ==================== CONFIG ====================
const API_BASE = 'http://localhost:8088/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Không tìm thấy token.  Vui lòng đăng nhập lại.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// ==================== HELPER ====================
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  console.log('🔵 API Request:', url, options);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    console.log('📥 API Response Status:', res.status);

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        console.error('❌ API Error Data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.error('❌ Cannot parse error response');
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    console.log('✅ API Response Data:', data);
    return data;
  } catch (error: any) {
    console.error('❌ API Call Failed:', error);
    throw error;
  }
}

// ==================== API CALLS ====================

/**
 * Get dashboard summary - All metrics and data
 */
export const getDashboardSummary = async (): Promise<
  ApiResponse<DashboardSummary>
> => {
  console.log('📊 Getting dashboard summary');
  return fetchWithErrorHandling<DashboardSummary>(
    `${API_BASE}/dashboard/summary`,
    {
      method: 'GET',
    },
  );
};

/**
 * Get monthly CO2 data for a specific year
 */
export const getMonthlyCo2Data = async (
  year?: number,
): Promise<ApiResponse<MonthlyData[]>> => {
  const currentYear = year || new Date().getFullYear();
  console.log('📈 Getting monthly CO2 data for year:', currentYear);

  return fetchWithErrorHandling<MonthlyData[]>(
    `${API_BASE}/dashboard/co2-monthly?year=${currentYear}`,
    { method: 'GET' },
  );
};

/**
 * Get monthly revenue data for a specific year
 */
export const getMonthlyRevenueData = async (
  year?: number,
): Promise<ApiResponse<MonthlyRevenueData[]>> => {
  const currentYear = year || new Date().getFullYear();
  console.log('💰 Getting monthly revenue data for year:', currentYear);

  return fetchWithErrorHandling<MonthlyRevenueData[]>(
    `${API_BASE}/dashboard/revenue-monthly?year=${currentYear}`,
    { method: 'GET' },
  );
};

/**
 * Get top projects by CO2
 */
export const getTopProjects = async (
  limit: number = 10,
): Promise<ApiResponse<TopProject[]>> => {
  console.log('🏆 Getting top projects, limit:', limit);

  return fetchWithErrorHandling<TopProject[]>(
    `${API_BASE}/dashboard/top-projects?limit=${limit}`,
    { method: 'GET' },
  );
};

/**
 * Get CO2 report for date range
 */
export const getCo2Report = async (
  fromDate: string,
  toDate: string,
): Promise<ApiResponse<any>> => {
  console.log('📋 Getting CO2 report:', fromDate, 'to', toDate);

  return fetchWithErrorHandling<any>(
    `${API_BASE}/reports/co2?fromDate=${fromDate}&toDate=${toDate}`,
    { method: 'GET' },
  );
};

/**
 * Get revenue report for year
 */
export const getRevenueReport = async (
  year: number,
): Promise<ApiResponse<any>> => {
  console.log('💵 Getting revenue report for year:', year);

  return fetchWithErrorHandling<any>(
    `${API_BASE}/reports/revenue?year=${year}`,
    { method: 'GET' },
  );
};

/**
 * Get credits report for year
 */
export const getCreditsReport = async (
  year: number,
): Promise<ApiResponse<any>> => {
  console.log('🎫 Getting credits report for year:', year);

  return fetchWithErrorHandling<any>(
    `${API_BASE}/reports/credits?year=${year}`,
    { method: 'GET' },
  );
};

/**
 * Export CO2 report to Excel
 */
export const exportCo2Excel = async (year: number): Promise<Blob> => {
  console.log('📥 Exporting CO2 report to Excel for year:', year);

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/reports/co2/export/excel?year=${year}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

/**
 * Export revenue report to Excel
 */
export const exportRevenueExcel = async (year: number): Promise<Blob> => {
  console.log('📥 Exporting revenue report to Excel for year:', year);

  const token = localStorage.getItem('token');
  const res = await fetch(
    `${API_BASE}/reports/revenue/export/excel?year=${year}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

/**
 * Export credits report to Excel
 */
export const exportCreditsExcel = async (year: number): Promise<Blob> => {
  console.log('📥 Exporting credits report to Excel for year:', year);

  const token = localStorage.getItem('token');
  const res = await fetch(
    `${API_BASE}/reports/credits/export/excel?year=${year}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

/**
 * Export CO2 report to PDF
 */
export const exportCo2Pdf = async (year: number): Promise<Blob> => {
  console.log('📥 Exporting CO2 report to PDF for year:', year);

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/reports/co2/export/pdf?year=${year}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

/**
 * Export revenue report to PDF
 */
export const exportRevenuePdf = async (year: number): Promise<Blob> => {
  console.log('📥 Exporting revenue report to PDF for year:', year);

  const token = localStorage.getItem('token');
  const res = await fetch(
    `${API_BASE}/reports/revenue/export/pdf?year=${year}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

/**
 * Export credits report to PDF
 */
export const exportCreditsPdf = async (year: number): Promise<Blob> => {
  console.log('📥 Exporting credits report to PDF for year:', year);

  const token = localStorage.getItem('token');
  const res = await fetch(
    `${API_BASE}/reports/credits/export/pdf?year=${year}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

/**
 * Helper function to download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
