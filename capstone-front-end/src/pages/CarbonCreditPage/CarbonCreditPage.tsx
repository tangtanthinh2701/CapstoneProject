import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { carbonCreditApi, type CarbonCredit } from '../../models/carbonCredit.api';

const statusBadge = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-500/20 text-green-400';
    case 'PENDING':
    case 'ISSUED':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'SOLD_OUT':
    case 'SOLD':
      return 'bg-blue-500/20 text-blue-400';
    case 'RETIRED':
      return 'bg-gray-500/20 text-gray-400';
    case 'VERIFIED':
      return 'bg-purple-500/20 text-purple-400';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

interface Summary {
  totalCredits: number;
  availableCredits: number;
  soldCredits: number;
  retiredCredits: number;
  totalValue: number;
}

export default function CarbonCreditPage() {
  const { isAdmin } = useAuth();

  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalCredits: 0,
    availableCredits: 0,
    soldCredits: 0,
    retiredCredits: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [creditsRes, summaryRes] = await Promise.all([
        carbonCreditApi.getAll({ page: 0, size: 100 }).catch(() => []),
        carbonCreditApi.getSummary().catch(() => null),
      ]);

      const creditsData = (creditsRes as any)?.data || creditsRes || [];
      setCredits(Array.isArray(creditsData) ? creditsData : []);

      if (summaryRes) {
        const s = (summaryRes as any)?.data || summaryRes;
        setSummary({
          totalCredits: s.totalCredits || s.creditsIssued || 0,
          availableCredits: s.availableCredits || s.creditsAvailable || 0,
          soldCredits: s.soldCredits || s.creditsSold || 0,
          retiredCredits: s.retiredCredits || 0,
          totalValue: s.totalValue || 0,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id: number) => {
    if (!window.confirm('Xác nhận xác thực tín chỉ này?')) return;
    try {
      await carbonCreditApi.verify(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xác thực thất bại');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="flex bg-[#07150D] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Tín chỉ Carbon' },
          ]}
        />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Tín chỉ Carbon</h1>
            <p className="text-gray-400 mt-1">
              Theo dõi, xác thực và quản lý giao dịch tín chỉ carbon.
            </p>
          </div>

          {isAdmin && (
            <button className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-xl font-semibold flex gap-2 transition">
              <span className="material-icons">add</span>
              Phát hành tín chỉ mới
            </button>
          )}
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Tổng tín chỉ</p>
            <p className="text-2xl font-bold mt-2">{summary.totalCredits.toLocaleString()}</p>
            <p className="text-green-400 text-xs mt-1">Đã phát hành</p>
          </div>

          <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Tín chỉ có sẵn</p>
            <p className="text-2xl font-bold mt-2 text-green-400">{summary.availableCredits.toLocaleString()}</p>
            <p className="text-gray-400 text-xs mt-1">Có thể giao dịch</p>
          </div>

          <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Đã bán</p>
            <p className="text-2xl font-bold mt-2 text-blue-400">{summary.soldCredits.toLocaleString()}</p>
            <p className="text-gray-400 text-xs mt-1">Tín chỉ đã giao dịch</p>
          </div>

          <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5">
            <p className="text-gray-400 text-sm">Giá trị ước tính</p>
            <p className="text-2xl font-bold mt-2 text-yellow-400">{formatCurrency(summary.totalValue)}</p>
            <p className="text-gray-400 text-xs mt-1">Tổng giá trị</p>
          </div>
        </div>

        {/* CREDITS LIST */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-400">Đang tải...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl">
            <p>{error}</p>
            <button onClick={loadData} className="mt-2 text-sm underline">Thử lại</button>
          </div>
        ) : credits.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="material-icons text-6xl mb-4 opacity-30">eco</span>
            <p>Chưa có tín chỉ carbon nào</p>
          </div>
        ) : (
          <div className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E3A2B]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Mã tín chỉ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">CO₂ (tấn)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Đã phát hành</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Còn lại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Giá/credit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Trạng thái</th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {credits.map((credit) => (
                  <tr key={credit.id} className="border-b border-[#1E3A2B] hover:bg-[#13271F] transition">
                    <td className="px-6 py-4">
                      <span className="font-mono text-green-400">{credit.creditCode}</span>
                    </td>
                    <td className="px-6 py-4 text-white">{credit.totalCo2Tons?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-300">{credit.creditsIssued?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-400 font-semibold">{credit.creditsAvailable?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-300">{formatCurrency(credit.basePricePerCredit || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(credit.creditStatus)}`}>
                        {credit.creditStatus}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        {credit.creditStatus === 'PENDING' && (
                          <button
                            onClick={() => handleVerify(credit.id)}
                            className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition"
                            title="Xác thực"
                          >
                            <span className="material-icons text-sm">verified</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
