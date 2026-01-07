import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useFarmDetailViewModel } from '../../viewmodels/useFarmViewModel';
import AddTreeModal from '../../components/AddTreeModal';
import { deleteFarm } from '../../models/farm.api';

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border border-gray-300';
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const healthBadgeClass = (status: string) => {
  switch (status) {
    case 'HEALTHY':
      return 'bg-green-100 text-green-800';
    case 'WEAK':
      return 'bg-yellow-100 text-yellow-800';
    case 'SICK':
      return 'bg-orange-100 text-orange-800';
    case 'DYING':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function FarmDetailPage() {
  const navigate = useNavigate();
  const { farm, trees, loading, error, addTree, reload } =
    useFarmDetailViewModel();

  const [showAddTreeModal, setShowAddTreeModal] = useState(false);

  const handleDelete = async () => {
    if (!farm) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa nông trại này? ')) return;

    try {
      await deleteFarm(farm.id);
      alert('Xóa thành công!');
      navigate('/farms');
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  if (loading) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4'></div>
          <p className='text-gray-400'>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen'>
        <Sidebar />
        <main className='flex-1 p-8'>
          <div className='bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl'>
            <h2 className='text-xl font-bold mb-2'>⚠️ Lỗi</h2>
            <p>{error || 'Không tìm thấy nông trại'}</p>
            <button
              onClick={() => navigate('/farms')}
              className='mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg'
            >
              Quay lại danh sách
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý nông trại', href: '/farms' },
            { label: farm.name },
          ]}
        />

        {/* HEADER */}
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>{farm.name}</h1>
            <div className='flex items-center gap-3'>
              <span className='text-gray-400 font-mono text-sm'>
                {farm.code}
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(
                  farm.farmStatus,
                )}`}
              >
                {farm.farmStatus}
              </span>
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => navigate(`/farms/${farm.id}/edit`)}
              className='px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-2'
            >
              <span className='material-icons text-lg'>edit</span>
              Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2'
            >
              <span className='material-icons text-lg'>delete</span>
              Xóa
            </button>
          </div>
        </div>

        {/* DESCRIPTION */}
        {farm.description && (
          <p className='text-gray-300 mb-6 leading-relaxed'>
            {farm.description}
          </p>
        )}

        {/* STATS */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Tổng diện tích</p>
              <span className='material-icons text-green-500'>terrain</span>
            </div>
            <p className='text-2xl font-bold text-green-400'>
              {farm.area.toLocaleString()} m²
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              SD: {farm.usableArea.toLocaleString()} m²
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Tổng số cây</p>
              <span className='material-icons text-blue-500'>park</span>
            </div>
            <p className='text-2xl font-bold text-blue-400'>
              {farm.totalTrees.toLocaleString()}
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              Sống: {farm.aliveTrees} | Chết: {farm.deadTrees}
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Số loài cây</p>
              <span className='material-icons text-purple-500'>nature</span>
            </div>
            <p className='text-2xl font-bold text-purple-400'>
              {farm.totalSpecies || trees.length}
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>CO₂ ước tính</p>
              <span className='material-icons text-yellow-500'>eco</span>
            </div>
            <p className='text-2xl font-bold text-yellow-400'>
              {farm.totalEstimatedCarbon?.toFixed(1) || 0} tấn
            </p>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          {/* LOCATION */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
              <span className='material-icons text-blue-500'>location_on</span>
              Vị trí
            </h3>
            <p className='text-gray-300 text-sm mb-2'>{farm.location}</p>
            <p className='text-xs text-gray-400'>
              📍 {farm.latitude}, {farm.longitude}
            </p>
          </div>

          {/* ENVIRONMENT */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
              <span className='material-icons text-green-500'>wb_sunny</span>
              Môi trường
            </h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Loại đất:</span>
                <span className='text-gray-200'>{farm.soilType}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Khí hậu:</span>
                <span className='text-gray-200'>{farm.climateZone}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Lượng mưa TB:</span>
                <span className='text-gray-200'>{farm.avgRainfall} mm</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Nhiệt độ TB:</span>
                <span className='text-gray-200'>{farm.avgTemperature}°C</span>
              </div>
            </div>
          </div>

          {/* METADATA */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <h3 className='font-semibold text-lg mb-3 flex items-center gap-2'>
              <span className='material-icons text-yellow-500'>info</span>
              Thông tin
            </h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Ngày trồng:</span>
                <span className='text-gray-200'>
                  {new Date(farm.plantingDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Ngày tạo:</span>
                <span className='text-gray-200'>
                  {new Date(farm.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Cập nhật:</span>
                <span className='text-gray-200'>
                  {new Date(farm.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TREES IN FARM */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-semibold text-xl flex items-center gap-2'>
              <span className='material-icons text-green-500'>forest</span>
              Cây trong nông trại ({trees.length})
            </h3>
            <button
              onClick={() => setShowAddTreeModal(true)}
              className='px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-2'
            >
              <span className='material-icons text-lg'>add</span>
              Thêm cây
            </button>
          </div>

          {trees.length === 0 ? (
            <div className='text-center py-12 text-gray-400'>
              <span className='material-icons text-5xl mb-2 opacity-30'>
                nature_people
              </span>
              <p>Chưa có cây nào trong nông trại này. </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {trees.map((tree) => (
                <div
                  key={tree.id}
                  className='p-4 bg-[#071811] rounded-lg border border-[#1E3A2B] hover:border-green-500/30 transition'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <h4 className='font-semibold text-lg'>
                        {tree.treeSpeciesName}
                      </h4>
                      <p className='text-sm text-gray-400 italic'>
                        {tree.scientificName}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${healthBadgeClass(
                        tree.currentAvgHealthStatus,
                      )}`}
                    >
                      {tree.currentAvgHealthStatus}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    <div>
                      <p className='text-gray-400 text-xs mb-1'>Số lượng</p>
                      <p className='font-semibold text-blue-400'>
                        {tree.numberTrees.toLocaleString()}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Còn: {tree.availableTrees} | Bán: {tree.soldTrees}
                      </p>
                    </div>

                    <div>
                      <p className='text-gray-400 text-xs mb-1'>Tuổi</p>
                      <p className='font-semibold'>
                        {tree.ageInYears} năm {tree.ageInMonths} tháng
                      </p>
                    </div>

                    <div>
                      <p className='text-gray-400 text-xs mb-1'>Chiều cao TB</p>
                      <p className='font-semibold'>
                        {tree.currentAvgHeight} cm
                      </p>
                    </div>

                    <div>
                      <p className='text-gray-400 text-xs mb-1'>CO₂ ước tính</p>
                      <p className='font-semibold text-green-400'>
                        {tree.totalEstimatedCarbon.toFixed(1)} tấn
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ADD TREE MODAL */}
      {showAddTreeModal && (
        <AddTreeModal
          farmId={farm.id}
          farmLatitude={farm.latitude}
          farmLongitude={farm.longitude}
          onClose={() => setShowAddTreeModal(false)}
          onSuccess={() => {
            setShowAddTreeModal(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
