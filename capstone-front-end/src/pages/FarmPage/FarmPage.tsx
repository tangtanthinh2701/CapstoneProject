import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { farmApi, type Farm } from '../../models/farm.api';

const statusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border border-gray-300';
    case 'CLOSED':
      return 'bg-red-100 text-red-800 border border-red-300';
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

export default function FarmPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // State
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await farmApi.getAll({ page: 0, size: 100 });
      const data = (response as any)?.data || response || [];
      setFarms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không tải được danh sách nông trại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Filter
  const filtered = farms.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.location && f.location.toLowerCase().includes(search.toLowerCase())) ||
      (f.code && f.code.toLowerCase().includes(search.toLowerCase()))
  );

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
            <p className="text-gray-400">
              Quản lý các nông trại trồng rừng trong hệ thống.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/farms/new')}
              className="bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              <span className="material-icons">add</span>
              Thêm nông trại mới
            </button>
          )}
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm nông trại..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
            <button onClick={loadData} className="mt-2 text-sm underline">
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="material-icons text-6xl mb-4 opacity-30">local_florist</span>
            <p>Chưa có nông trại nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((farm) => (
              <div
                key={farm.id}
                className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] hover:border-green-500/50 transition overflow-hidden cursor-pointer"
                onClick={() => navigate(`/farms/${farm.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-400 font-mono mb-1">{farm.code}</p>
                      <h3 className="text-lg font-bold text-white">{farm.name}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(farm.farmStatus)}`}>
                      {farm.farmStatus}
                    </span>
                  </div>

                  {farm.location && (
                    <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                      <span className="material-icons text-sm">location_on</span>
                      {farm.location}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Diện tích</p>
                      <p className="font-semibold">{farm.area?.toLocaleString()} m²</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Sử dụng</p>
                      <p className="font-semibold">{farm.usableArea?.toLocaleString() || 0} m²</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#1E3A2B]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/farms/${farm.id}/edit`);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(farm.id);
                        }}
                        className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
