import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { contractApi, type Contract } from '../../models/contract.api';

const statusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'EXPIRED':
      return 'bg-red-100 text-red-800';
    case 'TERMINATED':
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const typeBadge = (type: string) => {
  switch (type) {
    case 'OWNERSHIP':
      return 'bg-blue-500/20 text-blue-400';
    case 'INVESTMENT':
      return 'bg-purple-500/20 text-purple-400';
    case 'SERVICE':
      return 'bg-orange-500/20 text-orange-400';
    case 'CREDIT_PURCHASE':
      return 'bg-green-500/20 text-green-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

export default function ContractPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = isAdmin
        ? await contractApi.getAll({ page: 0, size: 100 })
        : await contractApi.getMyContracts({ page: 0, size: 100 });

      const data = (response as any)?.data || response || [];
      setContracts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không tải được danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const filtered = contracts.filter((c) => {
    const matchSearch = c.contractCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.contractStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="flex bg-[#07150D] min-h-screen text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý hợp đồng' },
          ]}
        />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Hợp đồng</h1>
            <p className="text-gray-400">
              {isAdmin ? 'Quản lý tất cả hợp đồng trong hệ thống' : 'Các hợp đồng của bạn'}
            </p>
          </div>

          <button
            onClick={() => navigate('/contracts/new')}
            className="bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
          >
            <span className="material-icons">add</span>
            Tạo hợp đồng
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Tìm theo mã hợp đồng..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="TERMINATED">Đã hủy</option>
          </select>
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="material-icons text-6xl mb-4 opacity-30">description</span>
            <p>Chưa có hợp đồng nào</p>
          </div>
        ) : (
          <div className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E3A2B]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Mã HĐ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Loại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Giá trị</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ngày bắt đầu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b border-[#1E3A2B] hover:bg-[#13271F] transition cursor-pointer"
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-green-400">{contract.contractCode}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${typeBadge(contract.contractType)}`}>
                        {contract.contractType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {formatCurrency(contract.totalValue)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(contract.contractStatus)}`}>
                        {contract.contractStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/contracts/${contract.id}`);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <span className="material-icons">visibility</span>
                      </button>
                    </td>
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
