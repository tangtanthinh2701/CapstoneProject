import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import {
  getTreeSpeciesList,
  deleteTreeSpecies,
  type TreeSpecies,
} from '../../models/treeSpecies.api';

export default function TreeSpeciesPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [species, setSpecies] = useState<TreeSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTreeSpeciesList({ page: 0, size: 100 });
      const data = (response as any)?.data || response || [];
      setSpecies(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa loài cây này?')) return;
    try {
      await deleteTreeSpecies(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  const filtered = species.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.scientificName && s.scientificName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex bg-[#07150D] min-h-screen text-white">
      <Sidebar />

      <main className="flex-1 p-8">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý loài cây' },
          ]}
        />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Loài Cây</h1>
            <p className="text-gray-400">Quản lý các loài cây trồng trong hệ thống.</p>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/tree-species/new')}
              className="bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              <span className="material-icons">add</span>
              Thêm loài cây
            </button>
          )}
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm loài cây..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

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
            <span className="material-icons text-6xl mb-4 opacity-30">forest</span>
            <p>Chưa có loài cây nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] hover:border-green-500/50 transition overflow-hidden cursor-pointer"
                onClick={() => navigate(`/tree-species/${item.id}`)}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                  {item.scientificName && (
                    <p className="text-sm text-gray-400 italic mb-3">{item.scientificName}</p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-icons text-green-500 text-sm">eco</span>
                    <span className="text-sm text-gray-300">
                      {item.baseCarbonRate} kg CO₂/năm
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                  )}

                  {isAdmin && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#1E3A2B]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tree-species/${item.id}/edit`);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
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
