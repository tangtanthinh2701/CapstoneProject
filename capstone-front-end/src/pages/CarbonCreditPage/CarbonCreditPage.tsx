import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { carbonCreditApi } from '../../models/carbonCredit.api';
import type { CarbonCredit, CreditSummary } from '../../models/carbonCredit.model';

const statusBadge = (status?: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'ISSUED':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'SOLD_OUT':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'RETIRED':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
  }
};

export default function CarbonCreditPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [creditsRes, summaryRes] = await Promise.all([
        carbonCreditApi.getAll({ page: 0, size: 100 }),
        carbonCreditApi.getSummary(),
      ]);

      setCredits(creditsRes.data || []);
      setSummary(summaryRes.data);
    } catch (err: any) {
      setError(err.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Xác nhận xác thực và kích hoạt tín chỉ này?')) return;
    try {
      await carbonCreditApi.verify(id);
      alert('Đã xác thực tín chỉ thành công!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xác thực thất bại');
    }
  };

  const formatCurrency = (value?: number | null) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  return (
    <div className="flex bg-[#07150D] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Tín chỉ Carbon' },
          ]}
        />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">TÍN CHỈ CARBON</h1>
            <p className="text-gray-400 mt-1">
              Hệ thống quản lý, phát hành và giao dịch tín chỉ carbon minh bạch.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/credits/new')}
              className="bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-xl font-bold flex gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95"
            >
              <span className="material-icons">add_circle</span>
              Phát hành Tín chỉ
            </button>
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full group-hover:bg-green-500/10 transition-all"></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {isAdmin ? 'Đã phát hành' : 'Tín chỉ có sẵn'}
            </p>
            <p className="text-3xl font-black mt-2 text-green-400">
              {isAdmin
                ? (summary?.totalCreditsIssued || 0).toLocaleString()
                : (summary?.totalCreditsAvailable || 0).toLocaleString()}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-400 font-bold">
              <span className="material-icons text-sm">trending_up</span>
              <span>{isAdmin ? 'Tất cả các năm' : 'Có thể mua ngay'}</span>
            </div>
          </div>

          <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-all"></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Đã giao dịch</p>
            <p className="text-3xl font-black mt-2 text-blue-400">{(summary?.totalCreditsSold || 0).toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-400/70 font-bold">
              <span className="material-icons text-sm">shopping_cart</span>
              <span>Hợp đồng & Lẻ</span>
            </div>
          </div>

          <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:bg-purple-500/10 transition-all"></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">CO₂ Thu hồi</p>
            <p className="text-3xl font-black mt-2 text-purple-400">{(summary?.totalCo2Tons || 0).toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-purple-400/70 font-bold">
              <span className="material-icons text-sm">eco</span>
              <span>Tấn CO₂e</span>
            </div>
          </div>

          {isAdmin ? (
            <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 rounded-full group-hover:bg-yellow-500/10 transition-all"></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tổng doanh thu</p>
              <p className="text-2xl font-black mt-2 text-yellow-500">{formatCurrency(summary?.totalRevenue)}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500/70 font-bold">
                <span className="material-icons text-sm">payments</span>
                <span>Doanh thu tích lũy</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 rounded-full group-hover:bg-yellow-500/10 transition-all"></div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Giá trung bình</p>
              <p className="text-2xl font-black mt-2 text-yellow-500">{formatCurrency(summary?.averagePricePerCredit)}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-yellow-500/70 font-bold">
                <span className="material-icons text-sm">analytics</span>
                <span>Biến động thị trường</span>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold animate-pulse">ĐANG TẢI DỮ LIỆU...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/10 border border-red-500/20 text-red-400 px-8 py-6 rounded-3xl flex flex-col items-center gap-4">
            <span className="material-icons text-4xl">error_outline</span>
            <p className="text-center font-medium">{error}</p>
            <button onClick={loadData} className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all font-bold">Thử lại</button>
          </div>
        ) : credits.length === 0 ? (
          <div className="text-center py-32 bg-[#0E2219] border border-[#1E3A2B] rounded-3xl border-dashed">
            <span className="material-icons text-6xl mb-4 text-gray-700">cloud_off</span>
            <p className="text-gray-500 font-bold">CHƯA CÓ TÍN CHỈ NÀO ĐƯỢC PHÁT HÀNH</p>
          </div>
        ) : (
          <div className="bg-[#0E2219] rounded-3xl border border-[#1E3A2B] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0A1812] border-b border-[#1E3A2B]">
                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Mã tín chỉ</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Dự án</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Năm</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center">CO₂ (tấn)</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Khả dụng</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3A2B]">
                  {credits.map((credit) => (
                    <tr
                      key={credit.id}
                      className="hover:bg-[#13271F] transition-all cursor-pointer group"
                      onClick={() => navigate(`/credits/${credit.id}`)}
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-green-400 font-bold group-hover:text-green-300 transition-colors uppercase tracking-tight">{credit.creditCode}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-200">{credit.projectName || '—'}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{credit.verificationStandard || 'VCS'}</div>
                      </td>
                      <td className="px-6 py-5 text-center text-gray-300 font-bold">{credit.issuanceYear}</td>
                      <td className="px-6 py-5 text-center font-black text-blue-400">{credit.totalCo2Tons?.toLocaleString()}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-white font-black">{(credit.creditsAvailable || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold">/ {credit.creditsIssued?.toLocaleString()} issued</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${statusBadge(credit.creditsStatus)}`}>
                          {credit.creditsStatus || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {isAdmin && credit.creditsStatus === 'PENDING' && (
                            <button
                              onClick={(e) => handleVerify(e, credit.id)}
                              className="w-10 h-10 flex items-center justify-center bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all shadow-lg shadow-purple-500/10"
                              title="Xác thực & Kích hoạt"
                            >
                              <span className="material-icons text-sm">verified</span>
                            </button>
                          )}
                          {!isAdmin && credit.creditsStatus === 'AVAILABLE' && (
                            <button
                              className="px-4 h-10 flex items-center justify-center bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500 hover:text-black transition-all font-black text-[10px] uppercase tracking-tighter shadow-lg shadow-green-500/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/credits/${credit.id}`);
                              }}
                            >
                              Mua ngay
                            </button>
                          )}
                          <button
                            className="w-10 h-10 flex items-center justify-center bg-gray-500/10 text-gray-400 rounded-xl hover:bg-white hover:text-black transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/credits/${credit.id}`);
                            }}
                          >
                            <span className="material-icons text-sm">chevron_right</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
