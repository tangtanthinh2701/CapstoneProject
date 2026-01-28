import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { farmApi, type Farm } from '../../models/farm.api';

const statusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800';
    case 'CLOSED':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

export default function FarmDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAdmin, hasRole } = useAuth();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await farmApi.getById(id);
        const data = (response as any)?.data || response;
        setFarm(data);
      } catch (err: any) {
        setError(err.message || 'Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (!farm) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa nông trại này?')) return;

    try {
      await farmApi.delete(farm.id);
      navigate('/farms');
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

  if (error || !farm) {
    return (
      <div className="flex bg-[#07150D] text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl">
            <p>{error || 'Không tìm thấy nông trại'}</p>
            <button onClick={() => navigate('/farms')} className="mt-2 text-sm underline">
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
            { label: 'Quản lý nông trại', href: '/farms' },
            { label: farm.name },
          ]}
        />

        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-400 font-mono mb-1">{farm.code}</p>
            <h1 className="text-3xl font-bold mb-2">{farm.name}</h1>
            <span className={`px-3 py-1 text-sm rounded-full ${statusBadge(farm.farmStatus)}`}>
              {farm.farmStatus}
            </span>
          </div>

          {(isAdmin || (hasRole(['FARMER']) && farm.createdBy === user?.id)) && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/farms/${farm.id}/edit`)}
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

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Location */}
          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-blue-500">location_on</span>
              Vị trí
            </h3>
            <p className="text-gray-300">{farm.location || 'Chưa có thông tin'}</p>
            {farm.latitude && farm.longitude && (
              <p className="text-sm text-gray-400 mt-2">
                {farm.latitude}, {farm.longitude}
              </p>
            )}
          </div>

          {/* Area */}
          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-green-500">terrain</span>
              Diện tích
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Tổng:</span>
                <span className="font-semibold">{farm.area?.toLocaleString()} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sử dụng:</span>
                <span className="font-semibold">{farm.usableArea?.toLocaleString() || 0} m²</span>
              </div>
            </div>
          </div>

          {/* Environment */}
          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-yellow-500">eco</span>
              Môi trường
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Loại đất:</span>
                <span className="font-semibold">{farm.soilType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Khí hậu:</span>
                <span className="font-semibold text-blue-400">{farm.climateZone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lượng mưa TB:</span>
                <span className="font-semibold text-yellow-400">{farm.avgRainfall || 0} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nhiệt độ TB:</span>
                <span className="font-semibold text-red-400">{farm.avgTemperature || 0} °C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {farm.description && (
          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <h3 className="text-lg font-semibold mb-4">Mô tả</h3>
            <p className="text-gray-300">{farm.description}</p>
          </div>
        )}
      </main>
    </div>
  );
}
