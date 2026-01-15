import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useDashboardViewModel } from '../../viewmodels/useDashboardViewModel';
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

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return value.toLocaleString('vi-VN');
};

const formatNumber = (value: number) => {
  return value.toLocaleString('vi-VN');
};

const COLORS = [
  '#10B981',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    summary,
    monthlyCo2,
    monthlyRevenue,
    topProjects,
    loading,
    error,
    exportLoading,
    selectedYear,
    setSelectedYear,
    reload,
    exportCo2Excel,
    exportRevenueExcel,
  } = useDashboardViewModel();

  const [chartTab, setChartTab] = useState<'co2' | 'revenue'>('co2');

  if (loading) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen'>
        <Sidebar />
        <main className='flex-1 p-8 flex items-center justify-center'>
          <div className='text-center'>
            <div className='inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mb-4'></div>
            <p className='text-gray-400 text-lg'>
              Đang tải dữ liệu dashboard...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen'>
        <Sidebar />
        <main className='flex-1 p-8'>
          <div className='bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl'>
            <h2 className='text-xl font-bold mb-2'>⚠️ Lỗi</h2>
            <p>{error || 'Không tải được dữ liệu dashboard'}</p>
            <button
              onClick={reload}
              className='mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg'
            >
              Thử lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Prepare chart data
  const co2ChartData = monthlyCo2.map((m) => ({
    name: m.monthName,
    value: m.value,
  }));

  const revenueChartData = monthlyRevenue.map((m) => ({
    name: m.monthName,
    value: m.value / 1000000, // Convert to millions
    count: m.count,
  }));

  const projectsPieData = topProjects.slice(0, 5).map((p) => ({
    name: p.projectName,
    value: p.totalCo2Absorbed,
  }));

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8 overflow-y-auto'>
        {/* HEADER */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Dashboard Tổng Quan</h1>
            <p className='text-gray-400'>
              Theo dõi hoạt động và hiệu suất hệ thống trồng rừng carbon
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <select
              className='px-4 py-2 bg-[#0E2219] border border-[#1E3A2B] rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  Năm {year}
                </option>
              ))}
            </select>

            <button
              onClick={reload}
              className='px-4 py-2 bg-[#0E2219] border border-[#1E3A2B] hover:bg-[#13271F] rounded-lg text-gray-100 flex items-center gap-2 transition'
              disabled={loading}
            >
              <span className='material-icons text-sm'>refresh</span>
              Làm mới
            </button>

            <div className='relative group'>
              <button className='px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-2 transition'>
                <span className='material-icons text-sm'>download</span>
                Xuất báo cáo
              </button>

              {/* Dropdown */}
              <div className='hidden group-hover:block absolute right-0 mt-2 w-56 bg-[#0E2219] border border-[#1E3A2B] rounded-lg shadow-xl z-50'>
                <div className='p-2'>
                  <button
                    onClick={exportCo2Excel}
                    disabled={exportLoading}
                    className='w-full px-4 py-2 text-left hover:bg-[#13271F] rounded flex items-center gap-2 transition'
                  >
                    <span className='material-icons text-green-500 text-sm'>
                      table_chart
                    </span>
                    CO2 Report (Excel)
                  </button>
                  <button
                    onClick={exportRevenueExcel}
                    disabled={exportLoading}
                    className='w-full px-4 py-2 text-left hover:bg-[#13271F] rounded flex items-center gap-2 transition'
                  >
                    <span className='material-icons text-blue-500 text-sm'>
                      table_chart
                    </span>
                    Revenue Report (Excel)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {/* Total Projects */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] hover:border-green-500/50 transition cursor-pointer'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-3 bg-green-500/20 rounded-lg'>
                <span className='material-icons text-green-500 text-2xl'>
                  folder
                </span>
              </div>
              <div className='text-right'>
                <p className='text-3xl font-bold text-white'>
                  {summary.totalProjects}
                </p>
                <p className='text-xs text-gray-400 mt-1'>dự án</p>
              </div>
            </div>
            <p className='text-sm text-gray-400'>Tổng Dự Án</p>
            <p className='text-xs text-green-400 mt-1'>
              {summary.activeProjects} đang hoạt động
            </p>
          </div>

          {/* CO2 Absorbed */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] hover:border-blue-500/50 transition cursor-pointer'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-3 bg-blue-500/20 rounded-lg'>
                <span className='material-icons text-blue-500 text-2xl'>
                  eco
                </span>
              </div>
              <div className='text-right'>
                <p className='text-3xl font-bold text-white'>
                  {formatNumber(summary.totalCo2AbsorbedTons)}
                </p>
                <p className='text-xs text-gray-400 mt-1'>tấn CO₂</p>
              </div>
            </div>
            <p className='text-sm text-gray-400'>Tín Chỉ Carbon</p>
            <p className='text-xs text-blue-400 mt-1'>
              {summary.co2CompletionPercentage.toFixed(1)}% mục tiêu
            </p>
          </div>

          {/* Revenue */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] hover:border-yellow-500/50 transition cursor-pointer'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-3 bg-yellow-500/20 rounded-lg'>
                <span className='material-icons text-yellow-500 text-2xl'>
                  paid
                </span>
              </div>
              <div className='text-right'>
                <p className='text-3xl font-bold text-white'>
                  {formatCurrency(summary.totalRevenue)}
                </p>
                <p className='text-xs text-gray-400 mt-1'>VND</p>
              </div>
            </div>
            <p className='text-sm text-gray-400'>Doanh Thu</p>
            <p className='text-xs text-yellow-400 mt-1'>
              {summary.totalCreditsSold} tín chỉ đã bán
            </p>
          </div>

          {/* Performance */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] hover:border-purple-500/50 transition cursor-pointer'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-3 bg-purple-500/20 rounded-lg'>
                <span className='material-icons text-purple-500 text-2xl'>
                  trending_up
                </span>
              </div>
              <div className='text-right'>
                <p className='text-3xl font-bold text-white'>
                  {summary.co2CompletionPercentage.toFixed(1)}%
                </p>
                <p className='text-xs text-gray-400 mt-1'>hiệu suất</p>
              </div>
            </div>
            <p className='text-sm text-gray-400'>Hiệu Suất Hấp Thụ</p>
            <p className='text-xs text-purple-400 mt-1'>
              ✅ {summary.aliveTrees.toLocaleString()} cây sống
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          {/* MAIN CHART */}
          <div className='lg:col-span-2 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>
                Hiệu Suất Hấp Thụ Carbon
              </h2>
              <div className='flex gap-2'>
                <button
                  onClick={() => setChartTab('co2')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    chartTab === 'co2'
                      ? 'bg-green-500 text-black'
                      : 'bg-[#071811] text-gray-400 hover:text-white'
                  }`}
                >
                  CO₂
                </button>
                <button
                  onClick={() => setChartTab('revenue')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    chartTab === 'revenue'
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#071811] text-gray-400 hover:text-white'
                  }`}
                >
                  Doanh thu
                </button>
              </div>
            </div>

            <ResponsiveContainer width='100%' height={300}>
              {chartTab === 'co2' ? (
                <LineChart data={co2ChartData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1E3A2B' />
                  <XAxis dataKey='name' stroke='#9CA3AF' />
                  <YAxis stroke='#9CA3AF' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E2219',
                      border: '1px solid #1E3A2B',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='value'
                    stroke='#10B981'
                    strokeWidth={3}
                    name='CO₂ (tấn)'
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#1E3A2B' />
                  <XAxis dataKey='name' stroke='#9CA3AF' />
                  <YAxis stroke='#9CA3AF' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E2219',
                      border: '1px solid #1E3A2B',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey='value'
                    fill='#3B82F6'
                    name='Doanh thu (triệu VND)'
                  />
                </BarChart>
              )}
            </ResponsiveContainer>

            <div className='grid grid-cols-3 gap-4 mt-4'>
              <div className='p-3 bg-[#071811] rounded-lg'>
                <p className='text-xs text-gray-400 mb-1'>Mục tiêu CO₂</p>
                <p className='text-lg font-semibold text-green-400'>
                  {formatNumber(summary.targetCo2)} tấn
                </p>
              </div>
              <div className='p-3 bg-[#071811] rounded-lg'>
                <p className='text-xs text-gray-400 mb-1'>Đã hấp thụ</p>
                <p className='text-lg font-semibold text-blue-400'>
                  {formatNumber(summary.totalCo2AbsorbedTons)} tấn
                </p>
              </div>
              <div className='p-3 bg-[#071811] rounded-lg'>
                <p className='text-xs text-gray-400 mb-1'>Còn lại</p>
                <p className='text-lg font-semibold text-orange-400'>
                  {formatNumber(
                    summary.targetCo2 - summary.totalCo2AbsorbedTons,
                  )}{' '}
                  tấn
                </p>
              </div>
            </div>
          </div>

          {/* ACTIVITY FEED */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              <span className='material-icons text-yellow-500'>
                notifications
              </span>
              Hoạt Động Gần Đây
            </h2>

            {summary.recentActivities.length === 0 ? (
              <div className='text-center py-8 text-gray-400'>
                <span className='material-icons text-4xl mb-2 opacity-30'>
                  inbox
                </span>
                <p className='text-sm'>Chưa có hoạt động nào</p>
              </div>
            ) : (
              <div className='space-y-3 max-h-[400px] overflow-y-auto'>
                {summary.recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className='p-3 bg-[#071811] rounded-lg hover:bg-[#0A1A12] transition cursor-pointer'
                    onClick={() => {
                      if (activity.activityType === 'CONTRACT') {
                        navigate(`/contracts/${activity.referenceId}`);
                      }
                    }}
                  >
                    <div className='flex items-start gap-3'>
                      <div
                        className={`p-2 rounded-lg ${
                          activity.activityType === 'CONTRACT'
                            ? 'bg-blue-500/20'
                            : activity.activityType === 'CREDIT'
                              ? 'bg-green-500/20'
                              : 'bg-purple-500/20'
                        }`}
                      >
                        <span
                          className={`material-icons text-sm ${
                            activity.activityType === 'CONTRACT'
                              ? 'text-blue-400'
                              : activity.activityType === 'CREDIT'
                                ? 'text-green-400'
                                : 'text-purple-400'
                          }`}
                        >
                          {activity.activityType === 'CONTRACT'
                            ? 'description'
                            : activity.activityType === 'CREDIT'
                              ? 'eco'
                              : 'account_balance_wallet'}
                        </span>
                      </div>

                      <div className='flex-1'>
                        <p className='text-sm text-white font-medium'>
                          {activity.description}
                        </p>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-xs text-gray-400 font-mono'>
                            {activity.referenceCode}
                          </span>
                          <span className='text-xs text-gray-500'>•</span>
                          <span className='text-xs text-gray-400'>
                            {new Date(activity.timestamp).toLocaleDateString(
                              'vi-VN',
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/contracts')}
              className='w-full mt-4 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition'
            >
              <span className='material-icons text-sm'>arrow_forward</span>
              Xem Chi Tiết
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className='grid grid-cols-1 lg: grid-cols-2 gap-6'>
          {/* TOP PROJECTS */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Top Dự Án Theo CO₂</h2>
              <button
                onClick={() => navigate('/projects')}
                className='text-sm text-green-400 hover:text-green-300 flex items-center gap-1'
              >
                Xem tất cả
                <span className='material-icons text-sm'>arrow_forward</span>
              </button>
            </div>

            {topProjects.length === 0 ? (
              <div className='text-center py-8 text-gray-400'>
                <span className='material-icons text-4xl mb-2 opacity-30'>
                  folder_off
                </span>
                <p className='text-sm'>Chưa có dự án nào</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {topProjects.slice(0, 5).map((project, index) => (
                  <div
                    key={project.projectId}
                    className='p-4 bg-[#071811] rounded-lg hover:bg-[#0A1A12] transition cursor-pointer'
                    onClick={() => navigate(`/projects/${project.projectId}`)}
                  >
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full'>
                        <span className='text-green-400 font-bold text-sm'>
                          #{index + 1}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-white'>
                          {project.projectName}
                        </h3>
                        <p className='text-xs text-gray-400 font-mono'>
                          {project.projectCode}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-lg font-bold text-green-400'>
                          {formatNumber(project.totalCo2Absorbed)}
                        </p>
                        <p className='text-xs text-gray-400'>tấn CO₂</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className='mt-2'>
                      <div className='flex justify-between text-xs text-gray-400 mb-1'>
                        <span>Tiến độ</span>
                        <span>{project.completionPercentage.toFixed(1)}%</span>
                      </div>
                      <div className='w-full h-2 bg-gray-700 rounded-full overflow-hidden'>
                        <div
                          className='h-2 bg-green-500 rounded-full transition-all'
                          style={{
                            width: `${Math.min(project.completionPercentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CONTRACTS SUMMARY */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Tổng Quan Hợp Đồng</h2>
              <button
                onClick={() => navigate('/contracts')}
                className='text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1'
              >
                Xem tất cả
                <span className='material-icons text-sm'>arrow_forward</span>
              </button>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-6'>
              <div className='p-4 bg-[#071811] rounded-lg'>
                <p className='text-sm text-gray-400 mb-1'>Tổng hợp đồng</p>
                <p className='text-3xl font-bold text-white'>
                  {summary.totalContracts}
                </p>
              </div>

              <div className='p-4 bg-[#071811] rounded-lg'>
                <p className='text-sm text-gray-400 mb-1'>Đang hoạt động</p>
                <p className='text-3xl font-bold text-green-400'>
                  {summary.activeContracts}
                </p>
              </div>

              <div className='p-4 bg-[#071811] rounded-lg'>
                <p className='text-sm text-gray-400 mb-1'>Sắp hết hạn</p>
                <p className='text-3xl font-bold text-orange-400'>
                  {summary.expiringSoonContracts}
                </p>
              </div>

              <div className='p-4 bg-[#071811] rounded-lg'>
                <p className='text-sm text-gray-400 mb-1'>Tổng giá trị</p>
                <p className='text-2xl font-bold text-yellow-400'>
                  {formatCurrency(summary.totalContractValue)}
                </p>
              </div>
            </div>

            {/* Pie Chart */}
            {projectsPieData.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-gray-400 mb-3'>
                  Phân bổ CO₂ theo dự án
                </h3>
                <ResponsiveContainer width='100%' height={200}>
                  <PieChart>
                    <Pie
                      data={projectsPieData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={(entry) => `${entry.name.substring(0, 15)}...`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {projectsPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0E2219',
                        border: '1px solid #1E3A2B',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* QUICK STATS BAR */}
        <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-[#0E2219] p-4 rounded-lg border border-[#1E3A2B]'>
            <p className='text-xs text-gray-400 mb-1'>Tổng nông trại</p>
            <p className='text-2xl font-bold text-white'>
              {summary.totalFarms}
            </p>
            <p className='text-xs text-green-400 mt-1'>
              {summary.activeFarms} hoạt động
            </p>
          </div>

          <div className='bg-[#0E2219] p-4 rounded-lg border border-[#1E3A2B]'>
            <p className='text-xs text-gray-400 mb-1'>Tổng số cây</p>
            <p className='text-2xl font-bold text-white'>
              {formatNumber(summary.totalTrees)}
            </p>
            <p className='text-xs text-green-400 mt-1'>
              {formatNumber(summary.aliveTrees)} sống
            </p>
          </div>

          <div className='bg-[#0E2219] p-4 rounded-lg border border-[#1E3A2B]'>
            <p className='text-xs text-gray-400 mb-1'>Tín chỉ đã phát hành</p>
            <p className='text-2xl font-bold text-white'>
              {summary.totalCreditsIssued}
            </p>
            <p className='text-xs text-blue-400 mt-1'>
              {summary.totalCreditsSold} đã bán
            </p>
          </div>

          <div className='bg-[#0E2219] p-4 rounded-lg border border-[#1E3A2B]'>
            <p className='text-xs text-gray-400 mb-1'>Tín chỉ khả dụng</p>
            <p className='text-2xl font-bold text-white'>
              {summary.totalCreditsAvailable}
            </p>
            <p className='text-xs text-purple-400 mt-1'>
              {summary.totalCreditsRetired} đã retired
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
