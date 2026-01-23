import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import {
  getDashboardSummary,
  getMonthlyCo2Data,
  getMonthlyRevenueData,
  getTopProjects,
  exportCo2Excel as apiExportCo2Excel,
  exportRevenueExcel as apiExportRevenueExcel,
  downloadBlob,
  type DashboardSummary,
  type MonthlyData,
  type MonthlyRevenueData,
  type TopProject,
} from '../../models/dashboard.api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ========================
// UTILITIES
// ========================
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  return value.toLocaleString('vi-VN');
};

const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('vi-VN');
};

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Default summary for fallback
const defaultSummary: DashboardSummary = {
  totalProjects: 0,
  activeProjects: 0,
  totalFarms: 0,
  activeFarms: 0,
  totalTrees: 0,
  aliveTrees: 0,
  totalCarbonCredits: 0,
  totalCo2AbsorbedTons: 0,
  targetCo2: 0,
  co2CompletionPercentage: 0,
  totalCreditsIssued: 0,
  totalCreditsSold: 0,
  totalCreditsAvailable: 0,
  totalCreditsRetired: 0,
  totalContracts: 0,
  activeContracts: 0,
  expiringSoonContracts: 0,
  totalContractValue: 0,
  totalRevenue: 0,
  recentActivities: [],
};

// ========================
// COMPONENT
// ========================
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // State
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [monthlyCo2, setMonthlyCo2] = useState<MonthlyData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueData[]>([]);
  const [topProjects, setTopProjects] = useState<TopProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartTab, setChartTab] = useState<'co2' | 'revenue'>('co2');

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, co2Res, revenueRes, projectsRes] = await Promise.all([
        getDashboardSummary().catch(() => null),
        getMonthlyCo2Data(selectedYear).catch(() => []),
        getMonthlyRevenueData(selectedYear).catch(() => []),
        getTopProjects(10).catch(() => []),
      ]);

      if (summaryRes) {
        const data = (summaryRes as any).data || summaryRes;
        setSummary({ ...defaultSummary, ...data });

        if (data.monthlyCo2Data) setMonthlyCo2(data.monthlyCo2Data);
        else if (Array.isArray(co2Res)) setMonthlyCo2((co2Res as any).data || co2Res);

        if (data.monthlyRevenueData) setMonthlyRevenue(data.monthlyRevenueData);
        else if (Array.isArray(revenueRes)) setMonthlyRevenue((revenueRes as any).data || revenueRes);

        if (data.topProjectsByCo2) setTopProjects(data.topProjectsByCo2);
        else if (Array.isArray(projectsRes)) setTopProjects((projectsRes as any).data || projectsRes);
      }
    } catch (err: any) {
      setError(err.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  // Export functions
  const handleExportCo2Excel = async () => {
    try {
      setExportLoading(true);
      const blob = await apiExportCo2Excel(selectedYear);
      downloadBlob(blob, `CO2_Report_${selectedYear}.xlsx`);
    } catch (err: any) {
      alert('Xuất file thất bại: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportRevenueExcel = async () => {
    try {
      setExportLoading(true);
      const blob = await apiExportRevenueExcel(selectedYear);
      downloadBlob(blob, `Revenue_Report_${selectedYear}.xlsx`);
    } catch (err: any) {
      alert('Xuất file thất bại: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Prepare chart data
  const co2ChartData = monthlyCo2.map((m) => ({
    name: m.monthName || `T${m.month}`,
    value: m.value || 0,
  }));

  const revenueChartData = monthlyRevenue.map((m) => ({
    name: m.monthName || `T${m.month}`,
    value: (m.value || m.revenue || 0) / 1000000,
    count: m.count || 0,
  }));

  const projectsPieData = topProjects.slice(0, 5).map((p) => ({
    name: p.projectName || p.name || 'N/A',
    value: p.totalCo2Absorbed || p.co2Absorbed || 0,
  }));

  // Loading state
  if (loading) {
    return (
      <div className="flex bg-[#07150D] text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-400 text-lg">Đang tải dữ liệu dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex bg-[#07150D] text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl">
            <h2 className="text-xl font-bold mb-2">⚠️ Lỗi</h2>
            <p>{error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Thử lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#07150D] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Dashboard Tổng Quan
              {isAdmin && <span className="ml-2 text-sm text-green-400 font-normal">(Admin)</span>}
            </h1>
            <p className="text-gray-400">
              Xin chào, {user?.fullName || 'Người dùng'}! Theo dõi hoạt động và hiệu suất hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2 bg-[#0E2219] border border-[#1E3A2B] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2026, 2025, 2026].map((year) => (
                <option key={year} value={year}>Năm {year}</option>
              ))}
            </select>

            <button
              onClick={loadData}
              className="px-4 py-2 bg-[#0E2219] border border-[#1E3A2B] hover:bg-[#13271F] rounded-lg text-gray-100 flex items-center gap-2 transition"
            >
              <span className="material-icons text-sm">refresh</span>
              Làm mới
            </button>

            {isAdmin && (
              <div className="relative group">
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-2 transition">
                  <span className="material-icons text-sm">download</span>
                  Xuất báo cáo
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-2 w-56 bg-[#0E2219] border border-[#1E3A2B] rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={handleExportCo2Excel}
                      disabled={exportLoading}
                      className="w-full px-4 py-2 text-left hover:bg-[#13271F] rounded flex items-center gap-2 transition"
                    >
                      <span className="material-icons text-green-500 text-sm">table_chart</span>
                      CO2 Report (Excel)
                    </button>
                    <button
                      onClick={handleExportRevenueExcel}
                      disabled={exportLoading}
                      className="w-full px-4 py-2 text-left hover:bg-[#13271F] rounded flex items-center gap-2 transition"
                    >
                      <span className="material-icons text-blue-500 text-sm">table_chart</span>
                      Revenue Report (Excel)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] hover:border-green-500/50 transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <span className="material-icons text-green-500 text-2xl">folder</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{summary.totalProjects}</p>
                <p className="text-xs text-gray-400 mt-1">dự án</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Tổng Dự Án</p>
            <p className="text-xs text-green-400 mt-1">{summary.activeProjects} đang hoạt động</p>
          </div>

          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <span className="material-icons text-blue-500 text-2xl">eco</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{formatNumber(summary.totalCo2AbsorbedTons)}</p>
                <p className="text-xs text-gray-400 mt-1">tấn CO₂</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Tín Chỉ Carbon</p>
            <p className="text-xs text-blue-400 mt-1">{(summary.co2CompletionPercentage || 0).toFixed(1)}% mục tiêu</p>
          </div>

          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] hover:border-yellow-500/50 transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <span className="material-icons text-yellow-500 text-2xl">paid</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</p>
                <p className="text-xs text-gray-400 mt-1">VND</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Doanh Thu</p>
            <p className="text-xs text-yellow-400 mt-1">{summary.totalCreditsSold} tín chỉ đã bán</p>
          </div>

          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] hover:border-purple-500/50 transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <span className="material-icons text-purple-500 text-2xl">trending_up</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{(summary.co2CompletionPercentage || 0).toFixed(1)}%</p>
                <p className="text-xs text-gray-400 mt-1">hiệu suất</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Hiệu Suất Hấp Thụ</p>
            <p className="text-xs text-purple-400 mt-1">✅ {(summary.aliveTrees || 0).toLocaleString()} cây sống</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Hiệu Suất Hấp Thụ Carbon</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartTab('co2')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${chartTab === 'co2' ? 'bg-green-500 text-black' : 'bg-[#071811] text-gray-400 hover:text-white'
                    }`}
                >
                  CO₂
                </button>
                <button
                  onClick={() => setChartTab('revenue')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${chartTab === 'revenue' ? 'bg-blue-500 text-white' : 'bg-[#071811] text-gray-400 hover:text-white'
                    }`}
                >
                  Doanh thu
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              {chartTab === 'co2' ? (
                <LineChart data={co2ChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A2B" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#0E2219', border: '1px solid #1E3A2B', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} name="CO₂ (tấn)" dot={{ fill: '#10B981', r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A2B" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#0E2219', border: '1px solid #1E3A2B', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Doanh thu (triệu VND)" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* TOP PROJECTS */}
          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Top Dự Án</h2>
              <button
                onClick={() => navigate('/projects')}
                className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
              >
                Xem tất cả
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
            </div>

            {topProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <span className="material-icons text-4xl mb-2 opacity-30">folder_off</span>
                <p className="text-sm">Chưa có dự án nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProjects.slice(0, 5).map((project, index) => (
                  <div
                    key={project.projectId || project.id || index}
                    className="p-3 bg-[#071811] rounded-lg hover:bg-[#0A1A12] transition cursor-pointer"
                    onClick={() => navigate(`/projects/${project.projectId || project.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full">
                        <span className="text-green-400 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">{project.projectName || project.name}</h3>
                        <p className="text-xs text-gray-400">{formatNumber(project.totalCo2Absorbed || project.co2Absorbed)} tấn CO₂</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0E2219] p-4 rounded-lg border border-[#1E3A2B]">
            <p className="text-xs text-gray-400 mb-1">Tổng nông trại</p>
            <p className="text-2xl font-bold text-white">{summary.totalFarms}</p>
            <p className="text-xs text-green-400 mt-1">{summary.activeFarms} hoạt động</p>
          </div>

          <div className="bg-[#0E2219] p-4 rounded-lg border border-[#1E3A2B]">
            <p className="text-xs text-gray-400 mb-1">Tổng số cây</p>
            <p className="text-2xl font-bold text-white">{formatNumber(summary.totalTrees)}</p>
            <p className="text-xs text-green-400 mt-1">{formatNumber(summary.aliveTrees)} sống</p>
          </div>

          <div className="bg-[#0E2219] p-4 rounded-lg border border-[#1E3A2B]">
            <p className="text-xs text-gray-400 mb-1">Tín chỉ phát hành</p>
            <p className="text-2xl font-bold text-white">{summary.totalCreditsIssued}</p>
            <p className="text-xs text-blue-400 mt-1">{summary.totalCreditsSold} đã bán</p>
          </div>

          <div className="bg-[#0E2219] p-4 rounded-lg border border-[#1E3A2B]">
            <p className="text-xs text-gray-400 mb-1">Hợp đồng</p>
            <p className="text-2xl font-bold text-white">{summary.totalContracts}</p>
            <p className="text-xs text-orange-400 mt-1">{summary.expiringSoonContracts} sắp hết hạn</p>
          </div>
        </div>
      </main>
    </div>
  );
}
