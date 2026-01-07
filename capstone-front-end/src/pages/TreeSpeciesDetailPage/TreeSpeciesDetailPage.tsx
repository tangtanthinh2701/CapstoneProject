import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  getTreeSpeciesById,
  deleteTreeSpecies,
} from '../../models/treeSpecies.api';
import type { TreeSpecies } from '../../models/treeSpecies.api';

export default function TreeSpeciesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<TreeSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTreeSpeciesById(Number(id));

        if (!response.success || !response.data) {
          throw new Error('Không tìm thấy loài cây');
        }

        setData(response.data);
      } catch (err: any) {
        console.error('Error loading tree species:', err);
        setError(err.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa loài cây này?')) return;

    try {
      await deleteTreeSpecies(Number(id));
      alert('Xóa thành công!');
      navigate('/tree-species');
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

  if (error || !data) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen'>
        <Sidebar />
        <main className='flex-1 p-8'>
          <div className='bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl'>
            <h2 className='text-xl font-bold mb-2'>⚠️ Lỗi</h2>
            <p>{error || 'Không tìm thấy loài cây'}</p>
            <button
              onClick={() => navigate('/tree-species')}
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

      <main className='flex-1 p-8 max-w-4xl mx-auto'>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý loài cây', href: '/tree-species' },
            { label: data.name },
          ]}
        />

        {/* Header */}
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>{data.name}</h1>
            <p className='text-gray-400 italic'>{data.scientificName}</p>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => navigate(`/tree-species/${id}/edit`)}
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

        {/* Image */}
        {data.imageUrl && (
          <div className='mb-6'>
            <img
              src={data.imageUrl}
              alt={data.name}
              className='w-full max-h-96 object-cover rounded-xl'
            />
          </div>
        )}

        {/* Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>CO₂ hấp thụ/năm</p>
              <span className='material-icons text-green-500'>eco</span>
            </div>
            <p className='text-2xl font-bold text-green-400'>
              {data.estimatedCarbonPerYear.toFixed(1)} tấn
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Dự đoán 5 năm</p>
              <span className='material-icons text-blue-500'>trending_up</span>
            </div>
            <p className='text-2xl font-bold text-blue-400'>
              {data.estimatedCarbon5Years.toFixed(1)} tấn
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Dự đoán 10 năm</p>
              <span className='material-icons text-purple-500'>insights</span>
            </div>
            <p className='text-2xl font-bold text-purple-400'>
              {data.estimatedCarbon10Years.toFixed(1)} tấn
            </p>
          </div>
        </div>

        {/* Description */}
        {data.description && (
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
            <h2 className='text-xl font-semibold mb-3 flex items-center gap-2'>
              <span className='material-icons text-yellow-500'>
                description
              </span>
              Mô tả
            </h2>
            <p className='text-gray-300 leading-relaxed'>{data.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-blue-500'>info</span>
            Thông tin bổ sung
          </h2>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-gray-400 mb-1'>Ngày tạo</p>
              <p className='font-semibold'>
                {new Date(data.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <p className='text-gray-400 mb-1'>Cập nhật lần cuối</p>
              <p className='font-semibold'>
                {new Date(data.updatedAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
