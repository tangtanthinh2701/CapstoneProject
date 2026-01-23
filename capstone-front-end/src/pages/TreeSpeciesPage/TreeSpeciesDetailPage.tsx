import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { getTreeSpeciesById, deleteTreeSpecies, type TreeSpecies } from '../../models/treeSpecies.api';

export default function TreeSpeciesDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [species, setSpecies] = useState<TreeSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getTreeSpeciesById(parseInt(id));
        const data = (response as any)?.data || response;
        setSpecies(data);
      } catch (err: any) {
        setError(err.message || 'Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (!species) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa loài cây này?')) return;

    try {
      await deleteTreeSpecies(species.id);
      navigate('/tree-species');
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#07150D] text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-400">Đang tải...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="flex bg-[#07150D] text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl">
            <p>{error || 'Không tìm thấy loài cây'}</p>
            <button onClick={() => navigate('/tree-species')} className="mt-2 text-sm underline">
              Quay lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#07150D] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Loài cây', href: '/tree-species' },
            { label: species.name },
          ]}
        />

        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{species.name}</h1>
            {species.scientificName && (
              <p className="text-gray-400 italic">{species.scientificName}</p>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/tree-species/${species.id}/edit`)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition"
              >
                <span className="material-icons text-sm">edit</span>
                Sửa
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition"
              >
                <span className="material-icons text-sm">delete</span>
                Xóa
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* IMAGE */}
          {species.imageUrl && (
            <div className="lg:col-span-1">
              <img
                src={species.imageUrl}
                alt={species.name}
                className="w-full h-64 object-cover rounded-xl border border-[#1E3A2B]"
              />
            </div>
          )}

          {/* INFO */}
          <div className={species.imageUrl ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-icons text-green-500">eco</span>
                Thông tin carbon
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#071811] p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-400">{species.baseCarbonRate}</p>
                  <p className="text-sm text-gray-400">kg CO₂/năm</p>
                </div>
                <div className="bg-[#071811] p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-400">{(species.baseCarbonRate * 5).toFixed(0)}</p>
                  <p className="text-sm text-gray-400">kg CO₂ (5 năm)</p>
                </div>
                <div className="bg-[#071811] p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-400">{(species.baseCarbonRate * 10).toFixed(0)}</p>
                  <p className="text-sm text-gray-400">kg CO₂ (10 năm)</p>
                </div>
              </div>

              {species.description && (
                <div>
                  <h4 className="font-semibold mb-2">Mô tả</h4>
                  <p className="text-gray-300">{species.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate('/tree-species')}
            className="px-6 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-lg text-gray-300 hover:bg-[#13271F] transition flex items-center gap-2"
          >
            <span className="material-icons">arrow_back</span>
            Quay lại danh sách
          </button>
        </div>
      </main>
    </div>
  );
}
