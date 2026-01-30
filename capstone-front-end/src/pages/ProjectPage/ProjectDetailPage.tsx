import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { projectApi, type Project, type ProjectPhase } from '../../models/project.api';
import { PhaseStatus, PhaseStatusLabels } from '../../models/project.model';

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'PLANNING': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'ACTIVE': return 'bg-green-100 text-green-800 border border-green-300';
    case 'COMPLETED': return 'bg-gray-100 text-gray-800 border border-gray-300';
    case 'CANCELLED': return 'bg-red-100 text-red-800 border border-red-300';
    default: return 'bg-gray-200 text-gray-700';
  }
};

const phaseStatusClass = (status: string) => {
  switch (status) {
    case 'PLANNING': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'PLANTING': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'GROWING': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'MATURE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'HARVESTING': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    case 'COMPLETED': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
};

const phaseStatusLabel = (status: string) => {
  return PhaseStatusLabels[status as PhaseStatus] || status;
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  // Partner management state
  const [partnerUserId, setPartnerUserId] = useState('');
  const [partnerLoading, setPartnerLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectApi.getById(projectId);
      const data = (res as any)?.data || res;
      setProject(data as Project);
    } catch (err: any) {
      console.error('Error loading project:', err);
      setError('Không thể tải thông tin dự án.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!project) return;
    try {
      setRecalculating(true);
      await projectApi.recalculate(project.id);
      alert('Đã cập nhật lại các chỉ số tính toán!');
      loadProject(project.id.toString());
    } catch (err: any) {
      alert('Tính toán lại thất bại: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setRecalculating(false);
    }
  };

  const handleAddPartner = async () => {
    if (!project || !partnerUserId.trim()) return;
    try {
      setPartnerLoading(true);
      await projectApi.addPartner(project.id, { partnerUserId });
      setPartnerUserId('');
      alert('Đã thêm đối tác!');
      loadProject(project.id.toString());
    } catch (err: any) {
      alert('Thêm đối tác thất bại: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setPartnerLoading(false);
    }
  };

  const handleRemovePartner = async (pUid: string) => {
    if (!project || !window.confirm('Xóa đối tác này khỏi dự án?')) return;
    try {
      await projectApi.removePartner(project.id, pUid);
      loadProject(project.id.toString());
    } catch (err: any) {
      alert('Xóa đối tác thất bại');
    }
  };

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

  if (error || !project) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen'>
        <Sidebar />
        <main className='flex-1 p-8'>
          <div className='bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-center max-w-2xl mx-auto'>
            <span className='material-icons text-5xl text-red-500 mb-4'>error_outline</span>
            <h2 className='text-2xl font-bold mb-2'>Lỗi</h2>
            <p className='text-gray-400 mb-6'>{error || 'Không tìm thấy dự án'}</p>
            <button
              onClick={() => navigate('/projects')}
              className='px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-all'
            >
              Quay lại danh sách
            </button>
          </div>
        </main>
      </div>
    );
  }

  const targetCo2 = project.targetCo2Kg || 0;
  const actualCo2 = project.actualCo2Kg || 0;
  const projectProgress = targetCo2 > 0 ? Math.round((actualCo2 / targetCo2) * 100) : 0;

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8 max-w-7xl mx-auto w-full'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Dự án', href: '/projects' },
            { label: project.name },
          ]}
        />

        {/* Header Section */}
        <div className='flex flex-wrap justify-between items-start gap-6 mb-8'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <h1 className='text-4xl font-bold tracking-tight'>{project.name}</h1>
              <span className={`px-4 py-1 rounded-full text-xs font-bold border ${statusBadgeClass(project.projectStatus)}`}>
                {project.projectStatus}
              </span>
              {project.isPublic && (
                <span className='p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full' title='Dự án công khai'>
                  <span className='material-icons text-xs'>public</span>
                </span>
              )}
            </div>
            <p className='text-gray-500 font-mono text-sm tracking-widest uppercase'>MÃ DỰ ÁN: {project.code}</p>
          </div>

          <div className='flex gap-3 shrink-0'>
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className='px-6 py-3 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50'
              title='Tính toán lại các chỉ số'
            >
              <span className={`material-icons ${recalculating ? 'animate-spin' : ''}`}>sync</span>
              {recalculating ? 'Đang tính...' : 'Tính lại'}
            </button>
            <button
              onClick={() => navigate(`/projects/${project.id}/edit`)}
              className='px-6 py-3 bg-green-500 text-black font-bold rounded-xl flex items-center gap-2 hover:bg-green-600 transition-all'
            >
              <span className='material-icons'>edit</span>
              Chỉnh sửa
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

          {/* Left Column: Info & Description */}
          <div className='lg:col-span-2 space-y-8'>

            {/* Description Card */}
            <div className='bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B]'>
              <h3 className='text-xl font-bold mb-4 flex items-center gap-2'>
                <span className='material-icons text-green-500'>description</span>
                Mô tả dự án
              </h3>
              <p className='text-gray-300 leading-relaxed text-lg'>
                {project.description || 'Dự án này chưa có mô tả chi tiết.'}
              </p>
            </div>

            {/* Phases Section */}
            <div>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-2xl font-bold flex items-center gap-3'>
                  <span className='material-icons text-blue-400'>timeline</span>
                  Giai Đoạn Triển Khai
                </h3>
                <span className='px-3 py-1 bg-[#0E2219] rounded-lg border border-[#1E3A2B] text-xs font-bold text-gray-400'>
                  {project.phases?.length || 0} GIAI ĐOẠN
                </span>
              </div>

              <div className='space-y-4'>
                {project.phases && project.phases.length > 0 ? (
                  project.phases.map((phase: ProjectPhase, idx: number) => (
                    <div key={idx} className='group bg-[#0E2219] rounded-2xl border border-[#1E3A2B] hover:border-blue-500/30 transition-all overflow-hidden'>
                      <div className='p-6 flex flex-col md:flex-row gap-6'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-2'>
                            <span className='w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30'>
                              {phase.phaseNumber}
                            </span>
                            <h4 className='text-lg font-bold group-hover:text-blue-400 transition-colors'>{phase.phaseName}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${phaseStatusClass(phase.phaseStatus)}`}>
                              {phaseStatusLabel(phase.phaseStatus)}
                            </span>
                          </div>
                          <p className='text-gray-400 text-sm mb-4 line-clamp-2'>{phase.description || 'Chưa có mô tả.'}</p>

                          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                            <div className='space-y-1'>
                              <p className='text-[10px] text-gray-500 uppercase font-bold'>Bắt đầu</p>
                              <p className='text-sm text-gray-200'>{formatDate(phase.plannedStartDate)}</p>
                            </div>
                            <div className='space-y-1'>
                              <p className='text-[10px] text-gray-500 uppercase font-bold'>Kết thúc</p>
                              <p className='text-sm text-gray-200'>{formatDate(phase.plannedEndDate)}</p>
                            </div>
                            <div className='space-y-1'>
                              <p className='text-[10px] text-gray-500 uppercase font-bold'>Ngân sách</p>
                              <p className='text-sm text-yellow-500 font-bold'>{formatCurrency(phase.budget)}</p>
                            </div>
                            <div className='space-y-1'>
                              <p className='text-[10px] text-gray-500 uppercase font-bold'>Mục tiêu CO₂</p>
                              <p className='text-sm text-green-500 font-bold'>{((phase.targetCo2Kg || 0) / 1000).toLocaleString()} Tấn</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phase Progress Bar */}
                      {(phase.targetCo2Kg || 0) > 0 && (
                        <div className='h-1 bg-[#071811] w-full'>
                          <div
                            className='h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                            style={{ width: `${Math.min(((phase.actualCo2Kg || 0) / (phase.targetCo2Kg || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='p-12 bg-[#0E2219] rounded-3xl border border-[#1E3A2B] border-dashed text-center opacity-50'>
                    <span className='material-icons text-5xl mb-2'>event_note</span>
                    <p>Chưa có giai đoạn nào.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Key Stats & Progress */}
          <div className='space-y-8'>

            {/* Progress Card */}
            <div className='bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B] text-center'>
              <h3 className='text-sm font-bold text-gray-500 uppercase tracking-widest mb-6'>Tiến Độ Carbon</h3>

              <div className='relative w-48 h-48 mx-auto mb-6'>
                <svg className='w-full h-full transform -rotate-90'>
                  <circle cx='96' cy='96' r='80' fill='none' stroke='#071811' strokeWidth='12' />
                  <circle
                    cx='96' cy='96' r='80'
                    fill='none' stroke='#22c55e' strokeWidth='12'
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - projectProgress / 100)}`}
                    strokeLinecap='round'
                    className='transition-all duration-1000'
                  />
                </svg>
                <div className='absolute inset-0 flex flex-col items-center justify-center font-bold'>
                  <span className='text-4xl'>{projectProgress}%</span>
                  <span className='text-[10px] text-gray-500'>HOÀN THÀNH</span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 bg-[#071811] rounded-2xl border border-[#1E3A2B]'>
                  <p className='text-[10px] text-gray-500 uppercase font-bold mb-1'>Đã Hấp Thụ</p>
                  <p className='text-xl font-bold text-blue-400'>
                    {(actualCo2 / 1000).toLocaleString()}
                    <span className='text-xs font-normal ml-1 text-gray-500'>tấn</span>
                  </p>
                </div>
                <div className='p-4 bg-[#071811] rounded-2xl border border-[#1E3A2B]'>
                  <p className='text-[10px] text-gray-500 uppercase font-bold mb-1'>Mục Tiêu</p>
                  <p className='text-xl font-bold text-green-400'>
                    {(targetCo2 / 1000).toLocaleString()}
                    <span className='text-xs font-normal ml-1 text-gray-500'>tấn</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className='bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B]'>
              <h3 className='text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-[#1E3A2B] pb-4'>Ngân Sách</h3>

              <div className='space-y-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20'>
                    <span className='material-icons text-yellow-500'>payments</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-xs text-gray-500 font-bold'>DỰ TOÁN</p>
                    <p className='text-xl font-bold text-white'>{formatCurrency(project.totalBudget)}</p>
                  </div>
                </div>

                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20'>
                    <span className='material-icons text-red-500'>account_balance_wallet</span>
                  </div>
                  <div className='flex-1'>
                    <p className='text-xs text-gray-500 font-bold'>ĐÃ CHI</p>
                    <p className='text-xl font-bold text-white'>{formatCurrency(project.actualCost)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PARTNER MANAGEMENT (ADMIN ONLY) */}
            {isAdmin && (
              <div className='bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B]'>
                <h3 className='text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-[#1E3A2B] pb-4'>Quản lý Đối tác</h3>

                <div className='flex flex-wrap gap-2 mb-6'>
                  {(project as any).partners?.map((partner: any) => (
                    <div key={partner.userId} className='px-3 py-1 bg-[#13271F] border border-[#1E3A2B] rounded-full flex items-center gap-2 text-xs'>
                      <span>{partner.fullname || partner.userId}</span>
                      <button
                        onClick={() => handleRemovePartner(partner.userId)}
                        className='text-red-400 hover:text-red-300'
                      >
                        <span className='material-icons text-[14px]'>close</span>
                      </button>
                    </div>
                  ))}
                  {(!(project as any).partners || (project as any).partners.length === 0) && (
                    <p className='text-xs text-gray-500'>Chưa có đối tác</p>
                  )}
                </div>

                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='User ID đối tác...'
                    value={partnerUserId}
                    onChange={(e) => setPartnerUserId(e.target.value)}
                    className='flex-1 px-3 py-2 bg-[#071811] border border-[#1E3A2B] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-500'
                  />
                  <button
                    onClick={handleAddPartner}
                    disabled={partnerLoading}
                    className='px-3 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg text-xs transition-all disabled:opacity-50'
                  >
                    {partnerLoading ? '...' : 'Thêm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
