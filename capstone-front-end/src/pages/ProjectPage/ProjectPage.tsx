import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { deleteProject } from '../../models/project.api';

interface PageableSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}
interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
  sort: PageableSort;
}

interface Project {
  id: number;
  code: string;
  name: string;
  description: string | null;
  locationText: string | null;
  area: number;
  areaUnit: string;
  plantingDate: string;
  totalTreesPlanned: number;
  totalTreesActual: number;
  projectStatus: string;
  numberOfPhases: number;
  numberOfTreeSpecies: number;
}
interface ApiResponse {
  content: Project[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  totalElements: number;
  totalPages: number;
}
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

export default function ProjectListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;

    try {
      await deleteProject(id);
      alert('Xóa thành công!');

      // Refresh list
      fetchProjects(page);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Xóa thất bại!');
    }
  };

  useEffect(() => {
    fetchProjects(page);
  }, [page]);
  const fetchProjects = async (pageNumber: number) => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      console.log('TOKEN FE:', token);

      const res = await fetch(
        `http://localhost:8088/api/projects/get-projects?page=${pageNumber}&size=${PAGE_SIZE}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!res.ok) {
        throw new Error(`Fail with HTTP ${res.status}`);
      }

      const result = await res.json();
      setResponse(result.data);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const projects = response?.content ?? [];

  // Search
  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8'>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý dự án' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-2'>Quản lý Dự án</h1>
        <p className='text-gray-400 mb-6'>Danh sách các dự án trồng rừng.</p>

        {/* SEARCH + FILTER */}
        <div className='flex flex-wrap items-center gap-4 mb-6'>
          <input
            type='text'
            placeholder='Tìm kiếm theo tên dự án...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='flex-1 px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl text-gray-100'
          />

          <select className='px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl text-gray-100'>
            <option>Tất cả trạng thái</option>
            <option value='PLANNING'>PLANNING</option>
            <option value='PLANTING'>PLANTING</option>
            <option value='GROWING'>GROWING</option>
            <option value='MATURE'>MATURE</option>
            <option value='HARVESTING'>HARVESTING</option>
            <option value='COMPLETED'>COMPLETED</option>
          </select>

          <button
            onClick={() => navigate('/projects/new')}
            className='bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-1'
          >
            <span className='material-icons'>add</span>
            Thêm mới dự án
          </button>
        </div>

        {/* TABLE */}
        <div className='bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-x-auto'>
          {/* HEADERS */}
          <div className='grid grid-cols-8 px-6 py-4 text-sm text-gray-300 border-b border-[#1E3A2B]'>
            <span className='col-span-3'>TÊN & MÃ DỰ ÁN</span>
            <span>TRẠNG THÁI</span>
            <span>ĐỊA ĐIỂM</span>
            <span>DIỆN TÍCH</span>
            <span>TỔNG CÂY</span>
            <span>HÀNH ĐỘNG</span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className='px-6 py-6 text-gray-400'>Đang tải dữ liệu...</div>
          )}

          {/* EMPTY */}
          {!loading && filteredProjects.length === 0 && (
            <div className='px-6 py-6 text-gray-400'>Không tìm thấy dự án.</div>
          )}

          {/* ROWS */}
          {!loading &&
            filteredProjects.map((p) => (
              <div
                key={p.id}
                className='grid grid-cols-8 px-6 py-4 border-b border-[#1E3A2B] hover:bg-[#13271F] transition'
              >
                {/* Tên + mã */}
                <div className='col-span-3'>
                  <div className='font-semibold'>{p.name}</div>
                  <div className='text-xs text-gray-400'>{p.code}</div>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full inline-block ${statusBadgeClass(
                      p.projectStatus,
                    )}`}
                  >
                    {p.projectStatus}
                  </span>
                </div>

                {/* Location */}
                <div className='text-sm'>{p.locationText ?? '—'}</div>

                {/* Area */}
                <div className='text-sm'>
                  {p.area.toLocaleString()} {p.areaUnit}
                </div>

                {/* Trees */}
                <div className='text-sm'>
                  {p.totalTreesActual}/{p.totalTreesPlanned}
                </div>

                {/* ACTIONS */}
                <div className='flex gap-4 items-center'>
                  <button
                    className='text-gray-200 hover:text-white'
                    onClick={() => {
                      console.log('CLICK OK', p.id);
                      navigate(`/projects/${p.id}`);
                    }}
                  >
                    <span className='material-icons'>visibility</span>
                  </button>

                  <button
                    className='text-green-400 hover:text-green-300'
                    onClick={() => navigate(`/projects/${p.id}/edit`)}
                  >
                    <span className='material-icons'>edit</span>
                  </button>

                  <button
                    className='text-red-400 hover:text-red-300'
                    onClick={() => handleDelete(p.id)}
                  >
                    <span className='material-icons'>delete</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* PAGINATION */}
        <div className='flex justify-between items-center mt-6 text-gray-300 text-sm'>
          <span>
            Hiển thị {projects.length} / {response?.totalElements ?? 0}
          </span>

          <div className='flex items-center gap-2'>
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className='px-3 py-1 rounded-xl bg-[#0E2219] border border-[#1E3A2B] disabled:opacity-30'
            >
              Previous
            </button>

            {Array.from({ length: response?.totalPages ?? 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                className={`px-3 py-1 rounded-xl border ${
                  idx === page
                    ? 'bg-green-600 border-green-500'
                    : 'bg-[#0E2219] border-[#1E3A2B]'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={page === (response?.totalPages ?? 1) - 1}
              onClick={() => setPage(page + 1)}
              className='px-3 py-1 rounded-xl bg-[#0E2219] border border-[#1E3A2B] disabled:opacity-30'
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
