import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { contractApi, type Contract } from '../../models/contract.api';

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border border-gray-300';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'EXPIRED':
      return 'bg-orange-100 text-orange-800 border border-orange-300';
    case 'TERMINATED':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

export default function ContractWorkflowPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'expiring'>('pending');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contractApi.getAll({ page: 0, size: 100 });
      const data = (response as any)?.data || response || [];
      setContracts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Xác nhận phê duyệt hợp đồng này?')) return;
    try {
      await contractApi.approve(id);
      alert('Phê duyệt thành công!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Thất bại');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;
    try {
      await contractApi.reject(id, reason);
      alert('Đã từ chối hợp đồng');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Thất bại');
    }
  };

  // Filter contracts
  const filteredContracts = contracts.filter((c) => {
    if (filter === 'pending') return c.contractStatus === 'PENDING';
    if (filter === 'expiring') {
      // Check if expiring in 30 days
      if (!c.endDate) return false;
      const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 30;
    }
    return true;
  });

  const pendingCount = contracts.filter((c) => c.contractStatus === 'PENDING').length;
  const expiringCount = contracts.filter((c) => {
    if (!c.endDate) return false;
    const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  }).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="flex bg-[#07150D] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Hợp đồng', href: '/contracts' },
            { label: 'Quy trình phê duyệt' },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Quy trình Phê duyệt Hợp đồng</h1>
          <p className="text-gray-400">Xử lý các hợp đồng chờ duyệt và sắp hết hạn</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`p-4 rounded-xl border transition text-left ${filter === 'all'
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-[#0E2219] border-[#1E3A2B] hover:border-green-500/50'
              }`}
          >
            <p className="text-2xl font-bold">{contracts.length}</p>
            <p className="text-sm text-gray-400">Tất cả hợp đồng</p>
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`p-4 rounded-xl border transition text-left ${filter === 'pending'
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                : 'bg-[#0E2219] border-[#1E3A2B] hover:border-yellow-500/50'
              }`}
          >
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-sm text-gray-400">Chờ phê duyệt</p>
          </button>

          <button
            onClick={() => setFilter('expiring')}
            className={`p-4 rounded-xl border transition text-left ${filter === 'expiring'
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-[#0E2219] border-[#1E3A2B] hover:border-orange-500/50'
              }`}
          >
            <p className="text-2xl font-bold">{expiringCount}</p>
            <p className="text-sm text-gray-400">Sắp hết hạn (30 ngày)</p>
          </button>
        </div>

        {/* CONTENT */}
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
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="material-icons text-6xl mb-4 opacity-30">description</span>
            <p>Không có hợp đồng nào trong danh mục này</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] p-6 hover:border-green-500/50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400 font-mono">{contract.contractCode}</p>
                    <h3 className="text-lg font-semibold mt-1">Dự án #{contract.projectId}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span>Giá trị: {formatCurrency(contract.totalValue)}</span>
                      <span>Loại: {contract.contractType}</span>
                      {contract.endDate && (
                        <span>Hết hạn: {new Date(contract.endDate).toLocaleDateString('vi-VN')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${statusBadgeClass(contract.contractStatus)}`}>
                      {contract.contractStatus}
                    </span>

                    {contract.contractStatus === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(contract.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-1 transition"
                        >
                          <span className="material-icons text-sm">check</span>
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(contract.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-1 transition"
                        >
                          <span className="material-icons text-sm">close</span>
                          Từ chối
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/contracts/${contract.id}`)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                    >
                      <span className="material-icons">visibility</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
