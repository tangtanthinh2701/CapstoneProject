import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectApi, type Project } from '../../models/project.api';
import { ProjectStatus, ProjectStatusLabels } from '../../models/project.model';

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
const PAGE_SIZE = 20;

// ========== HELPERS ==========
const statusBadgeClass = (projectStatus: string) => {
  switch (projectStatus) {
    case 'PLANNING':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border border-red-300';
    case 'COMPLETED':
      return 'bg-orange-100 text-gray-800 border border-gray-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const formatCurrency = (amount?: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

const formatCarbon = (amount?: number) => {
  return `${(amount || 0).toLocaleString('vi-VN')} tấn CO₂`;
};

// ========== COMPONENT ==========
export default function ProjectListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(0);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [recalculatingAll, setRecalculatingAll] = useState(false);

  // ========== FETCH ==========
  const fetchProjects = async (currentPage = page) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        size: PAGE_SIZE,
      };

      let res;
      if (search.trim()) {
        res = await projectApi.search(search, params);
      } else if (statusFilter && statusFilter !== 'ALL') {
        res = await projectApi.getByStatus(statusFilter, params);
      } else {
        res = await projectApi.getAll(params);
      }

      const result = res as any;
      if (result.success !== false) {
        setResponse(result);
      } else {
        throw new Error(result.message || 'API Error');
      }

    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateAll = async () => {
    if (!window.confirm('Tính toán lại toàn bộ dự án có thể mất thời gian. Tiếp tục?')) return;
    try {
      setRecalculatingAll(true);
      await projectApi.recalculateAll();
      alert('Đã bắt đầu tính toán lại toàn bộ dự án!');
      fetchProjects(0);
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Không thể tính toán lại'));
    } finally {
      setRecalculatingAll(false);
    }
  };

  // ========== DELETE ==========
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;

    try {
      await projectApi.delete(id);
      alert('Xóa thành công!');
      fetchProjects(page);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Xóa thất bại:  ${err.message || 'Lỗi không xác định'}`);
    }
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    setPage(0);
    fetchProjects(0);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  // ========== FILTER ==========
  const projects = response?.data ?? [];
  // No client-side filtering needed as we use API now

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

        <div className='flex justify-between items-end mb-6'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Quản lý Dự án</h1>
            <p className='text-gray-400'>Danh sách các dự án trồng rừng.</p>
          </div>
          <div className='flex gap-3'>
            {isAdmin && (
              <button
                onClick={handleRecalculateAll}
                disabled={recalculatingAll}
                className='px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/20 transition disabled:opacity-50 flex items-center gap-2'
              >
                <span className={`material-icons text-lg ${recalculatingAll ? 'animate-spin' : ''}`}>sync</span>
                Tính toán lại tất cả
              </button>
            )}
            <button
              onClick={() => navigate('/projects/new')}
              className='bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition'
            >
              <span className='material-icons text-lg'>add</span>
              Thêm mới dự án
            </button>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className='flex flex-wrap items-center gap-4 mb-6'>
          <div className='flex-1 relative'>
            <span className='material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>search</span>
            <input
              type='text'
              placeholder='Tìm kiếm theo tên dự án...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-12 pr-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl text-gray-100 focus:outline-none focus: ring-2 focus:ring-green-500'
          >
            <option value='ALL'>Tất cả trạng thái</option>
            {Object.entries(ProjectStatus).map(([_, value]) => (
              <option key={value} value={value}>{ProjectStatusLabels[value]}</option>
            ))}
          </select>
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
          {!loading && projects.length === 0 && (
            <div className='px-6 py-12 text-center text-gray-400'>
              <span className='material-icons text-5xl mb-2 opacity-50'>
                inbox
              </span>
              <p>Không tìm thấy dự án phù hợp.</p>
            </div>
          )}

          {/* ROWS */}
          {!loading &&
            projects.map((p) => {
              const target = p.targetCo2Kg || 0;
              const current = p.actualCo2Kg || 0;

              const carbonProgress =
                target > 0
                  ? (current / target) * 100
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
                    {formatCurrency(p.totalBudget || (p as any).budget)}
                  </div>

                  {/* Target CO2 */}
                  <div className='text-sm text-gray-300'>
                    {formatCarbon(target)}
                  </div>

                  {/* Current CO2 */}
                  <div className='text-sm text-green-400 font-semibold'>
                    {formatCarbon(current)}
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
              Hiển thị <strong>{projects.length}</strong> /{' '}
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
                          className={`px-3 py-2 rounded-xl border transition ${idx === page
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
