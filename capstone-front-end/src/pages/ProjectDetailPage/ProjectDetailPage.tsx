import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';


// ========== TYPES THEO API MỚI ==========
interface Phase {
  id: number;
  projectId: number;
  phaseOrder: number;
  phaseName: string;
  description: string | null;
  phaseStatus: string;
  expectedStartDate: string;
  expectedEndDate: string;
  actualStartDate: string | null;
  actualEndDate:  string | null;
  budget:  number;
  actualCost:  number;
  targetConsumedCarbon: number;
  currentConsumedCarbon: number;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectDetail {
  id: number;
  code: string;
  name: string;
  description:  string | null;
  projectStatus: string;
  managerId: string;
  isPublic: boolean;
  budget: number;
  targetConsumedCarbon: number;
  currentConsumedCarbon: number;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
  totalPhases: number;
  completedPhases: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data:  ProjectDetail;
  errors: any;
  timestamp: string;
  pageInfo: any;
}

// ========== HELPERS ==========
const statusBadgeClass = (status: string) => {
  switch (status) {
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
      return 'bg-gray-100 text-gray-800 border border-gray-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString:  string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

// ========== COMPONENT ==========
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'media'>(
    'overview',
  );

  // ========== FETCH ==========
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`http://localhost:8088/api/projects/${id}`, {
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
          throw new Error(`HTTP ${res.status}:  ${res.statusText}`);
        }

        const json: ApiResponse = await res.json();

        if (!json.success) {
          throw new Error(json. message || 'Failed to load project');
        }

        setProject(json.data);
      } catch (err:  any) {
        console.error('Error loading project:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProject();
    }
  }, [id, navigate]);

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4'></div>
          <p className='text-gray-400'>Đang tải thông tin dự án...</p>
        </div>
      </div>
    );
  }

  // ========== ERROR ==========
  if (error || !project) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen'>
        <Sidebar />
        <main className='flex-1 p-8'>
          <div className='bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl'>
            <h2 className='text-xl font-bold mb-2'>⚠️ Lỗi</h2>
            <p>{error || 'Không tìm thấy dự án hoặc đã bị xóa.'}</p>
            <button
              onClick={() => navigate('/projects')}
              className='mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg'
            >
              Quay lại danh sách
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ========== CALCULATIONS ==========
  const totalBudget = project.phases.reduce((sum, p) => sum + p.budget, 0);
  const totalActualCost = project.phases. reduce(
    (sum, p) => sum + p.actualCost,
    0,
  );
  const progressPercent =
    project.targetConsumedCarbon > 0
      ? Math.round(
          (project.currentConsumedCarbon / project. targetConsumedCarbon) * 100,
        )
      : 0;

  // ========== RENDER ==========
  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8'>
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Danh sách dự án', href: '/projects' },
            { label: project.name },
          ]}
        />

        {/* Title & Actions */}
        <div className='flex flex-wrap justify-between items-center gap-4 mb-6'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>{project.name}</h1>
            <div className='flex items-center gap-3'>
              <span className='text-gray-400 font-mono text-sm'>
                {project.code}
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(
                  project.projectStatus,
                )}`}
              >
                {project.projectStatus}
              </span>
              {project.isPublic && (
                <span className='px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-300'>
                  Công khai
                </span>
              )}
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => navigate(`/projects/${id}/edit`)}
              className='px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-2 transition'
            >
              <span className='material-icons text-lg'>edit</span>
              Chỉnh sửa
            </button>
            <button className='px-4 py-2 text-green-400 bg-[#0E2219] border border-[#1E3A2B] hover:bg-[#13271F] rounded-lg flex items-center gap-2 transition'>
              <span className='material-icons text-lg'>download</span>
              Xuất báo cáo
            </button>
            <button className='px-4 py-2 text-blue-400 bg-[#0E2219] border border-[#1E3A2B] hover:bg-[#13271F] rounded-lg flex items-center gap-2 transition'>
              <span className='material-icons text-lg'>archive</span>
              Lưu trữ
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className='text-gray-300 mb-6 leading-relaxed'>
            {project.description}
          </p>
        )}

        {/* 📊 Top Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Ngân sách dự án</p>
              <span className='material-icons text-yellow-500'>
                account_balance_wallet
              </span>
            </div>
            <p className='text-2xl font-bold text-yellow-400'>
              {formatCurrency(project.budget)}
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Mục tiêu CO₂</p>
              <span className='material-icons text-green-500'>eco</span>
            </div>
            <p className='text-2xl font-bold text-green-400'>
              {project.targetConsumedCarbon. toLocaleString()} tấn
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>CO₂ đã hấp thụ</p>
              <span className='material-icons text-blue-500'>
                cloud_download
              </span>
            </div>
            <p className='text-2xl font-bold text-blue-400'>
              {project.currentConsumedCarbon.toLocaleString()} tấn
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Giai đoạn hoàn thành</p>
              <span className='material-icons text-purple-500'>
                check_circle
              </span>
            </div>
            <p className='text-2xl font-bold text-purple-400'>
              {project.completedPhases} / {project.totalPhases}
            </p>
          </div>
        </div>

        {/* 📈 Progress Bar */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='font-semibold'>Tiến độ hấp thụ CO₂</h3>
            <span className='text-green-400 font-bold'>{progressPercent}%</span>
          </div>
          <div className='w-full h-4 bg-gray-700 rounded-full overflow-hidden'>
            <div
              className='h-4 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500'
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className='text-sm text-gray-400 mt-2'>
            {project.currentConsumedCarbon. toLocaleString()} /{' '}
            {project. targetConsumedCarbon.toLocaleString()} tấn CO₂
          </p>
        </div>

        {/* 📋 Content Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left:  Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Tabs */}
            <div className='bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden'>
              <div className='flex border-b border-[#1E3A2B]'>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === 'overview'
                      ? 'bg-[#13271F] text-green-400 border-b-2 border-green-500'
                      :  'text-gray-400 hover:text-white hover:bg-[#0A1812]'
                  }`}
                >
                  Tổng quan
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === 'history'
                      ?  'bg-[#13271F] text-green-400 border-b-2 border-green-500'
                      :  'text-gray-400 hover:text-white hover:bg-[#0A1812]'
                  }`}
                >
                  Lịch sử cập nhật
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === 'media'
                      ? 'bg-[#13271F] text-green-400 border-b-2 border-green-500'
                      : 'text-gray-400 hover: text-white hover:bg-[#0A1812]'
                  }`}
                >
                  Tài liệu & hình ảnh
                </button>
              </div>

              <div className='p-6'>
                {/* Tab:  Overview */}
                {activeTab === 'overview' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-gray-400 text-sm mb-1'>Ngày tạo</p>
                      <p className='font-semibold'>
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm mb-1'>
                        Cập nhật lần cuối
                      </p>
                      <p className='font-semibold'>
                        {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm mb-1'>
                        ID Người quản lý
                      </p>
                      <p className='font-mono text-sm'>{project.managerId}</p>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm mb-1'>
                        Tổng ngân sách giai đoạn
                      </p>
                      <p className='font-semibold'>
                        {formatCurrency(totalBudget)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm mb-1'>
                        Chi phí thực tế
                      </p>
                      <p className='font-semibold'>
                        {formatCurrency(totalActualCost)}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-400 text-sm mb-1'>
                        Còn lại ngân sách
                      </p>
                      <p
                        className={`font-semibold ${
                          totalBudget - totalActualCost >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {formatCurrency(totalBudget - totalActualCost)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab: History */}
                {activeTab === 'history' && (
                  <div className='text-gray-400 text-center py-8'>
                    <span className='material-icons text-5xl mb-2 opacity-30'>
                      history
                    </span>
                    <p>Tính năng lịch sử cập nhật đang được phát triển. </p>
                  </div>
                )}

                {/* Tab: Media */}
                {activeTab === 'media' && (
                  <div className='text-gray-400 text-center py-8'>
                    <span className='material-icons text-5xl mb-2 opacity-30'>
                      photo_library
                    </span>
                    <p>Tính năng tài liệu & hình ảnh đang được phát triển.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 📌 Phases */}
            <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
              <h3 className='font-semibold text-xl mb-4 flex items-center gap-2'>
                <span className='material-icons text-green-500'>timeline</span>
                Các giai đoạn triển khai ({project.phases.length})
              </h3>

              {project.phases.length === 0 ? (
                <div className='text-gray-400 text-center py-8'>
                  <span className='material-icons text-5xl mb-2 opacity-30'>
                    event_busy
                  </span>
                  <p>Chưa có giai đoạn nào được thêm. </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {project.phases. map((phase) => (
                    <div
                      key={phase.id}
                      className='p-5 bg-[#13271F] rounded-lg border border-[#1E3A2B] hover:border-green-500/30 transition'
                    >
                      {/* Header */}
                      <div className='flex justify-between items-start mb-3'>
                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded'>
                              #{phase.phaseOrder}
                            </span>
                            <h4 className='font-bold text-lg'>
                              {phase.phaseName}
                            </h4>
                          </div>
                          {phase.description && (
                            <p className='text-gray-300 text-sm'>
                              {phase.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(
                            phase.phaseStatus,
                          )}`}
                        >
                          {phase.phaseStatus}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className='grid grid-cols-2 gap-4 mb-3 text-sm'>
                        <div>
                          <p className='text-gray-400'>Dự kiến bắt đầu</p>
                          <p className='font-semibold'>
                            {formatDate(phase.expectedStartDate)}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-400'>Dự kiến kết thúc</p>
                          <p className='font-semibold'>
                            {formatDate(phase.expectedEndDate)}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-400'>Thực tế bắt đầu</p>
                          <p className='font-semibold'>
                            {formatDate(phase.actualStartDate || '')}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-400'>Thực tế kết thúc</p>
                          <p className='font-semibold'>
                            {formatDate(phase.actualEndDate || '')}
                          </p>
                        </div>
                      </div>

                      {/* Budget & Carbon */}
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div className='p-3 bg-[#0E2219] rounded-lg'>
                          <p className='text-gray-400 text-xs mb-1'>
                            Ngân sách
                          </p>
                          <p className='font-semibold text-yellow-400'>
                            {formatCurrency(phase.budget)}
                          </p>
                          <p className='text-xs text-gray-400 mt-1'>
                            Đã chi:  {formatCurrency(phase.actualCost)}
                          </p>
                        </div>
                        <div className='p-3 bg-[#0E2219] rounded-lg'>
                          <p className='text-gray-400 text-xs mb-1'>
                            CO₂ mục tiêu
                          </p>
                          <p className='font-semibold text-green-400'>
                            {phase.targetConsumedCarbon. toLocaleString()} tấn
                          </p>
                          <p className='text-xs text-gray-400 mt-1'>
                            Hiện tại:{' '}
                            {phase.currentConsumedCarbon. toLocaleString()} tấn
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {phase.notes && (
                        <div className='mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg'>
                          <p className='text-xs text-yellow-200 flex items-start gap-2'>
                            <span className='material-icons text-sm'>note</span>
                            {phase.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className='space-y-6'>
            {/* Project Info Card */}
            <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
              <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
                <span className='material-icons text-blue-500'>info</span>
                Thông tin dự án
              </h3>
              <div className='space-y-3 text-sm'>
                <div>
                  <p className='text-gray-400 mb-1'>Mã dự án</p>
                  <p className='font-mono bg-[#13271F] px-3 py-2 rounded'>
                    {project.code}
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 mb-1'>Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(
                      project.projectStatus,
                    )}`}
                  >
                    {project.projectStatus}
                  </span>
                </div>
                <div>
                  <p className='text-gray-400 mb-1'>Quyền truy cập</p>
                  <p className='font-semibold'>
                    {project.isPublic ? '🌐 Công khai' :  '🔒 Riêng tư'}
                  </p>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
              <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
                <span className='material-icons text-yellow-500'>
                  account_balance
                </span>
                Tóm tắt ngân sách
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-400 text-sm'>Tổng ngân sách</span>
                  <span className='font-semibold'>
                    {formatCurrency(project.budget)}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-400 text-sm'>
                    Ngân sách giai đoạn
                  </span>
                  <span className='font-semibold'>
                    {formatCurrency(totalBudget)}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-400 text-sm'>Đã chi</span>
                  <span className='font-semibold text-orange-400'>
                    {formatCurrency(totalActualCost)}
                  </span>
                </div>
                <div className='pt-3 border-t border-[#1E3A2B]'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-400 text-sm'>Còn lại</span>
                    <span
                      className={`font-bold text-lg ${
                        totalBudget - totalActualCost >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {formatCurrency(totalBudget - totalActualCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
              <h3 className='font-semibold text-lg mb-4'>Thao tác nhanh</h3>
              <div className='space-y-2'>
                <button className='w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center justify-center gap-2 transition'>
                  <span className='material-icons text-lg'>add</span>
                  Thêm giai đoạn mới
                </button>
                <button className='w-full px-4 py-2 bg-[#13271F] hover:bg-[#1A3328] border border-[#1E3A2B] text-gray-200 rounded-lg flex items-center justify-center gap-2 transition'>
                  <span className='material-icons text-lg'>upload_file</span>
                  Tải lên tài liệu
                </button>
                <button className='w-full px-4 py-2 bg-[#13271F] hover:bg-[#1A3328] border border-[#1E3A2B] text-gray-200 rounded-lg flex items-center justify-center gap-2 transition'>
                  <span className='material-icons text-lg'>
                    assessment
                  </span>
                  Xem báo cáo chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}