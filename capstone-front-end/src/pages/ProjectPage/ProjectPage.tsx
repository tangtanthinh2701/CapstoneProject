import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { deleteProject } from '../../models/project.api';

interface Project {
  id: number;
  code: string;
  name: string;
  description: string | null;
  projectStatus: string;
  managerId: string;
  isPublic: boolean;
  budget: number;
  targetConsumedCarbon: number;
  currentConsumedCarbon: number;
  createdAt: string;
  updatedAt: string;
  phases: any[] | null;
  totalPhases: number | null;
  completedPhases: number | null;
}

interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Project[];
  errors: any | null;
  timestamp: string;
  pageInfo: PageInfo;
}

// ========== CONFIG ==========
const API_BASE_URL = 'http://localhost:8088/api/projects';
const PAGE_SIZE = 20;

// ========== HELPERS ==========
const statusBadgeClass = (projectStatus: string) => {
  switch (projectStatus) {
    case 'PLANNING':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'PLANTING':
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'GROWING':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'MATURE':
      return 'bg-red-100 text-red-800 border border-red-300';
    case 'HARVESTING':
      return 'bg-purple-100 text-purple-800 border border-purple-300';
    case 'COMPLETED':
      return 'bg-orange-100 text-gray-800 border border-gray-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatCarbon = (amount: number) => {
  return `${amount.toLocaleString('vi-VN')} tấn CO₂`;
};

// ========== COMPONENT ==========
export default function ProjectListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ========== FETCH ==========
  const fetchProjects = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token.  Vui lòng đăng nhập lại.');
      }

      const url = `${API_BASE_URL}?page=${pageNumber}&size=${PAGE_SIZE}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const result: ApiResponse = await res.json();

      // ✅ Kiểm tra API trả về success
      if (!result.success) {
        throw new Error(result.message || 'API trả về lỗi');
      }

      setResponse(result);
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  // ========== DELETE ==========
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;

    try {
      await deleteProject(id);
      alert('Xóa thành công!');
      fetchProjects(page);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Xóa thất bại:  ${err.message || 'Lỗi không xác định'}`);
    }
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  // ========== FILTER ==========
  const projects = response?.data ?? [];
  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? p.projectStatus === statusFilter : true;
    return matchSearch && matchStatus;
  });

  // ========== RENDER ==========
  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý dự án' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-2'>Quản lý Dự án</h1>
        <p className='text-gray-400 mb-6'>Danh sách các dự án trồng rừng. </p>

        {/* SEARCH + FILTER */}
        <div className='flex flex-wrap items-center gap-4 mb-6'>
          <input
            type='text'
            placeholder='Tìm kiếm theo tên dự án...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='flex-1 min-w-[250px] px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500'
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl text-gray-100 focus:outline-none focus: ring-2 focus:ring-green-500'
          >
            <option value=''>Tất cả trạng thái</option>
            <option value='PLANNING'>PLANNING</option>
            <option value='PLANTING'>PLANTING</option>
            <option value='GROWING'>GROWING</option>
            <option value='MATURE'>MATURE</option>
            <option value='HARVESTING'>HARVESTING</option>
            <option value='COMPLETED'>COMPLETED</option>
          </select>

          <button
            onClick={() => navigate('/projects/new')}
            className='bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition'
          >
            <span className='material-icons text-lg'>add</span>
            Thêm mới dự án
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className='bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-6'>
            ⚠️ {error}
          </div>
        )}

        {/* TABLE */}
        <div className='bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden'>
          {/* HEADERS */}
          <div className='grid grid-cols-8 gap-4 px-6 py-4 text-sm font-semibold text-gray-300 border-b border-[#1E3A2B] bg-[#0A1812]'>
            <span className='col-span-2'>TÊN & MÃ DỰ ÁN</span>
            <span>TRẠNG THÁI</span>
            <span>NGÂN SÁCH</span>
            <span>MỤC TIÊU CO₂</span>
            <span>HIỆN TẠI CO₂</span>
            <span>TIẾN ĐỘ</span>
            <span className='text-center'>HÀNH ĐỘNG</span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className='px-6 py-12 text-center text-gray-400'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2'></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && filteredProjects.length === 0 && (
            <div className='px-6 py-12 text-center text-gray-400'>
              <span className='material-icons text-5xl mb-2 opacity-50'>
                inbox
              </span>
              <p>Không tìm thấy dự án phù hợp.</p>
            </div>
          )}

          {/* ROWS */}
          {!loading &&
            filteredProjects.map((p) => {
              const carbonProgress =
                p.targetConsumedCarbon > 0
                  ? (p.currentConsumedCarbon / p.targetConsumedCarbon) * 100
                  : 0;

              return (
                <div
                  key={p.id}
                  className='grid grid-cols-8 gap-4 items-center px-6 py-4 border-b border-[#1E3A2B] hover:bg-[#13271F] transition cursor-pointer'
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  {/* Tên + mã */}
                  <div className='col-span-2'>
                    <div className='font-semibold text-gray-100'>{p.name}</div>
                    <div className='text-xs text-gray-400 font-mono'>
                      {p.code}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${statusBadgeClass(
                        p.projectStatus,
                      )}`}
                    >
                      {p.projectStatus}
                    </span>
                  </div>

                  {/* Budget */}
                  <div className='text-sm text-gray-300'>
                    {formatCurrency(p.budget)}
                  </div>

                  {/* Target CO2 */}
                  <div className='text-sm text-gray-300'>
                    {formatCarbon(p.targetConsumedCarbon)}
                  </div>

                  {/* Current CO2 */}
                  <div className='text-sm text-green-400 font-semibold'>
                    {formatCarbon(p.currentConsumedCarbon)}
                  </div>

                  {/* Progress */}
                  <div className='flex flex-col gap-1'>
                    <div className='text-xs text-gray-400'>
                      {carbonProgress.toFixed(1)}%
                    </div>
                    <div className='w-full bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-green-500 h-2 rounded-full transition-all'
                        style={{ width: `${Math.min(carbonProgress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div
                    className='flex gap-3 items-center justify-center'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className='text-gray-400 hover:text-white transition'
                      onClick={() => navigate(`/projects/${p.id}`)}
                      title='Xem chi tiết'
                    >
                      <span className='material-icons text-xl'>visibility</span>
                    </button>

                    <button
                      className='text-green-400 hover:text-green-300 transition'
                      onClick={() => navigate(`/projects/${p.id}/edit`)}
                      title='Chỉnh sửa'
                    >
                      <span className='material-icons text-xl'>edit</span>
                    </button>

                    <button
                      className='text-red-400 hover:text-red-300 transition'
                      onClick={() => handleDelete(p.id)}
                      title='Xóa'
                    >
                      <span className='material-icons text-xl'>delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* PAGINATION */}
        {response?.pageInfo && response.pageInfo.totalPages > 0 && (
          <div className='flex justify-between items-center mt-6 text-gray-300 text-sm'>
            <span>
              Hiển thị <strong>{filteredProjects.length}</strong> /{' '}
              <strong>{response.pageInfo.totalElements}</strong> dự án
            </span>

            <div className='flex items-center gap-2'>
              <button
                disabled={!response.pageInfo.hasPrevious}
                onClick={() => setPage(page - 1)}
                className='px-4 py-2 rounded-xl bg-[#0E2219] border border-[#1E3A2B] hover:bg-[#13271F] disabled:opacity-40 disabled:cursor-not-allowed transition'
              >
                « Trước
              </button>

              {/* Page Numbers */}
              <div className='flex gap-1'>
                {Array.from({ length: response.pageInfo.totalPages }).map(
                  (_, idx) => {
                    // Hiển thị tối đa 5 trang xung quanh trang hiện tại
                    if (
                      idx === 0 ||
                      idx === response.pageInfo.totalPages - 1 ||
                      (idx >= page - 2 && idx <= page + 2)
                    ) {
                      return (
                        <button
                          key={idx}
                          onClick={() => setPage(idx)}
                          className={`px-3 py-2 rounded-xl border transition ${
                            idx === page
                              ? 'bg-green-600 border-green-500 text-white font-semibold'
                              : 'bg-[#0E2219] border-[#1E3A2B] hover:bg-[#13271F]'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    } else if (idx === page - 3 || idx === page + 3) {
                      return (
                        <span key={idx} className='px-2 py-2 text-gray-500'>
                          ...
                        </span>
                      );
                    }
                    return null;
                  },
                )}
              </div>

              <button
                disabled={!response.pageInfo.hasNext}
                onClick={() => setPage(page + 1)}
                className='px-4 py-2 rounded-xl bg-[#0E2219] border border-[#1E3A2B] hover:bg-[#13271F] disabled:opacity-40 disabled:cursor-not-allowed transition'
              >
                Sau »
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
