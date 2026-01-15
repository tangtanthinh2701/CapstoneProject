import { useState, useEffect } from 'react';
import {
  getDashboardSummary,
  getMonthlyCo2Data,
  getMonthlyRevenueData,
  getTopProjects,
  exportCo2Excel,
  exportRevenueExcel,
  exportCreditsExcel,
  exportCo2Pdf,
  exportRevenuePdf,
  exportCreditsPdf,
  downloadBlob,
  type DashboardSummary,
  type MonthlyData,
  type MonthlyRevenueData,
  type TopProject,
} from '../models/dashboard.api';

export const useDashboardViewModel = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlyCo2, setMonthlyCo2] = useState<MonthlyData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>(
    [],
  );
  const [topProjects, setTopProjects] = useState<TopProject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading dashboard data...');

      // Load all data in parallel
      const [summaryRes, co2Res, revenueRes, projectsRes] = await Promise.all([
        getDashboardSummary(),
        getMonthlyCo2Data(selectedYear).catch(
          () => ({ success: false, data: [] }) as any,
        ),
        getMonthlyRevenueData(selectedYear).catch(
          () => ({ success: false, data: [] }) as any,
        ),
        getTopProjects(10).catch(() => ({ success: false, data: [] }) as any),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);

        // Use summary data if individual APIs fail
        if (!co2Res.success && summaryRes.data.monthlyCo2Data) {
          setMonthlyCo2(summaryRes.data.monthlyCo2Data);
        } else if (co2Res.success && co2Res.data) {
          setMonthlyCo2(co2Res.data);
        }

        if (!revenueRes.success && summaryRes.data.monthlyRevenueData) {
          setMonthlyRevenue(summaryRes.data.monthlyRevenueData);
        } else if (revenueRes.success && revenueRes.data) {
          setMonthlyRevenue(revenueRes.data);
        }

        if (!projectsRes.success && summaryRes.data.topProjectsByCo2) {
          setTopProjects(summaryRes.data.topProjectsByCo2);
        } else if (projectsRes.success && projectsRes.data) {
          setTopProjects(projectsRes.data);
        }

        console.log('✅ Dashboard data loaded successfully');
      } else {
        throw new Error(
          summaryRes.message || 'Không tải được dữ liệu dashboard',
        );
      }
    } catch (err: any) {
      console.error('❌ Error loading dashboard:', err);
      setError(err.message || 'Không tải được dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedYear]);

  // Export functions
  const handleExportCo2Excel = async () => {
    try {
      setExportLoading(true);
      const blob = await exportCo2Excel(selectedYear);
      downloadBlob(blob, `CO2_Report_${selectedYear}.xlsx`);
      console.log('✅ CO2 Excel exported');
    } catch (err: any) {
      console.error('❌ Export failed:', err);
      alert('Xuất file thất bại:  ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportRevenueExcel = async () => {
    try {
      setExportLoading(true);
      const blob = await exportRevenueExcel(selectedYear);
      downloadBlob(blob, `Revenue_Report_${selectedYear}.xlsx`);
      console.log('✅ Revenue Excel exported');
    } catch (err: any) {
      console.error('❌ Export failed:', err);
      alert('Xuất file thất bại: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportCreditsExcel = async () => {
    try {
      setExportLoading(true);
      const blob = await exportCreditsExcel(selectedYear);
      downloadBlob(blob, `Credits_Report_${selectedYear}.xlsx`);
      console.log('✅ Credits Excel exported');
    } catch (err: any) {
      console.error('❌ Export failed:', err);
      alert('Xuất file thất bại: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportCo2Pdf = async () => {
    try {
      setExportLoading(true);
      const blob = await exportCo2Pdf(selectedYear);
      downloadBlob(blob, `CO2_Report_${selectedYear}.pdf`);
      console.log('✅ CO2 PDF exported');
    } catch (err: any) {
      console.error('❌ Export failed:', err);
      alert('Xuất file thất bại: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportRevenuePdf = async () => {
    try {
      setExportLoading(true);
      const blob = await exportRevenuePdf(selectedYear);
      downloadBlob(blob, `Revenue_Report_${selectedYear}.pdf`);
      console.log('✅ Revenue PDF exported');
    } catch (err: any) {
      console.error('❌ Export failed:', err);
      alert('Xuất file thất bại: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportCreditsPdf = async () => {
    try {
      setExportLoading(true);
      const blob = await exportCreditsPdf(selectedYear);
      downloadBlob(blob, `Credits_Report_${selectedYear}.pdf`);
      console.log('✅ Credits PDF exported');
    } catch (err: any) {
      console.error('❌ Export failed:', err);
      alert('Xuất file thất bại: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  return {
    summary,
    monthlyCo2,
    monthlyRevenue,
    topProjects,
    loading,
    error,
    exportLoading,
    selectedYear,
    setSelectedYear,
    reload: load,
    exportCo2Excel: handleExportCo2Excel,
    exportRevenueExcel: handleExportRevenueExcel,
    exportCreditsExcel: handleExportCreditsExcel,
    exportCo2Pdf: handleExportCo2Pdf,
    exportRevenuePdf: handleExportRevenuePdf,
    exportCreditsPdf: handleExportCreditsPdf,
  };
};
