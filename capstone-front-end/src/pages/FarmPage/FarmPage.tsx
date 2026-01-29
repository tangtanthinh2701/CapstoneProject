import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { farmApi, type Farm } from '../../models/farm.api';

const statusList = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'INACTIVE':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'CLOSED':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

export default function FarmPage() {
  const navigate = useNavigate();
  const { user, isAdmin, hasRole } = useAuth();
  const isFarmer = hasRole(['FARMER']);

  // State
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load data
  const loadData = async (currentPage = page) => {
    try {
      setLoading(true);
      setError(null);
      let response;
      const params = {
        page: currentPage,
        size: size
      };

      if (search.trim()) {
        response = await farmApi.search(search, params);
      } else if (status !== 'ALL') {
        response = await farmApi.getByStatus(status, params);
      } else if (isFarmer) {
        response = await farmApi.getMyFarms(params);
      } else {
        response = await farmApi.getAll(params);
      }

      // Cấu trúc Backend: { success: true, data: [], pageInfo: {} }
      // Interceptor trả về phần body nên response chính là object trên
      const body = response as any;

      if (body && typeof body === 'object' && body.pageInfo) {
        // Cấu trúc có phân trang của bạn
        setFarms(body.data || []);
        setTotalElements(body.pageInfo.totalElements);
        setTotalPages(body.pageInfo.totalPages);
      } else if (body && typeof body === 'object' && 'content' in body) {
        // Cấu trúc Spring Data JPA
        setFarms(body.content);
        setTotalElements(body.totalElements);
        setTotalPages(body.totalPages);
      } else {
        // Mảng đơn thuần hoặc không rõ cấu trúc
        const dataArr = Array.isArray(body) ? body : (body?.data || []);
        setFarms(dataArr);
        setTotalElements(dataArr.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || 'Không tải được danh sách nông trại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadData(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status]);

  useEffect(() => {
    loadData(page);
  }, [page, size]);

  // Delete farm
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa nông trại này?')) return;
    try {
      await farmApi.delete(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  // The filtering is now handled by server side in the updated loadData
  // but we keep the logic clean.
  const farmsToList = farms;

  return (
    <div className="flex bg-[#07150D] min-h-screen text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý nông trại' },
          ]}
        />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Nông trại</h1>
            <p className="text-gray-400 mt-1">
              Quản lý các nông trại trồng rừng trong hệ thống.
            </p>
          </div>

          {(isAdmin || isFarmer) && (
            <button
              onClick={() => navigate('/farms/new')}
              className="bg-[#00D064] hover:bg-[#00B054] text-black px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition"
            >
              <span className="material-icons">add</span>
              Thêm mới nông trại
            </button>
          )}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nông trại..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0E2219]/50 border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-[#00D064]/50 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-3 rounded-xl bg-[#0E2219]/50 border border-[#1E3A2B] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00D064]/50"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ngưng hoạt động</option>
            <option value="CLOSED">Bảo trì</option>
          </select>
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-[#0E2219]/30 rounded-2xl border border-[#1E3A2B] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E3A2B] bg-[#0E2219]/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tên & Mã Nông trại</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng diện tích</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Diện tích sử dụng</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Số lô cây</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Số cây</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A2B]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00D064]"></div>
                    <p className="mt-4 text-gray-400">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={() => loadData()} className="text-[#00D064] underline">Thử lại</button>
                  </td>
                </tr>
              ) : farmsToList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-500">
                    <span className="material-icons text-5xl mb-2 opacity-20">inventory_2</span>
                    <p>Không tìm thấy dữ liệu nông trại</p>
                  </td>
                </tr>
              ) : (
                farmsToList.map((farm) => (
                  <tr key={farm.id} className="hover:bg-[#00D064]/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white group-hover:text-[#00D064] transition-colors">{farm.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{farm.code}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${statusList(farm.farmStatus)}`}>
                        {farm.farmStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-300">
                      {farm.area?.toLocaleString()} m²
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-300">
                      <span className="text-blue-400 font-medium">{farm.usableArea?.toLocaleString() || 0}</span> m²
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-300">
                      {farm.totalBatches || 0}
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <span className="text-green-400 font-semibold">{farm.totalTrees || 0}</span> cây
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => navigate(`/farms/${farm.id}`)}
                          className="p-2 bg-[#0E2219] hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <span className="material-icons text-xl">visibility</span>
                        </button>
                        {(isAdmin || (isFarmer && farm.createdBy === user?.id)) && (
                          <>
                            <button
                              onClick={() => navigate(`/farms/${farm.id}/edit`)}
                              className="p-2 bg-[#0E2219] hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition"
                              title="Chỉnh sửa"
                            >
                              <span className="material-icons text-xl">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(farm.id)}
                              className="p-2 bg-[#0E2219] hover:bg-red-500/20 text-red-500 rounded-lg transition"
                              title="Xóa"
                            >
                              <span className="material-icons text-xl">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && farmsToList.length > 0 && (
          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="text-white font-bold">{farmsToList.length}</span> / <span className="text-white font-bold">{totalElements}</span> nông trại
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-[#0E2219] border border-[#1E3A2B] text-gray-400 rounded-lg hover:bg-[#1E3A2B] disabled:opacity-30 disabled:hover:bg-[#0E2219] transition flex items-center gap-2"
              >
                <span className="material-icons text-sm whitespace-nowrap">chevron_left</span>
                Trước
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`min-w-[40px] h-10 rounded-lg font-bold transition ${page === i ? 'bg-[#00D064] text-black' : 'bg-[#0E2219] text-gray-400 border border-[#1E3A2B] hover:border-[#00D064]/50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-[#0E2219] border border-[#1E3A2B] text-gray-400 rounded-lg hover:bg-[#1E3A2B] disabled:opacity-30 disabled:hover:bg-[#0E2219] transition flex items-center gap-2"
              >
                Sau
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
