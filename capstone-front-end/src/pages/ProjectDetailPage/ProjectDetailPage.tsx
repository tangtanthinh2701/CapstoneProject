import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  getCarbonSummary,
  type CarbonSummary,
} from '../../models/treePurchase.api';
import TreePurchaseModal from '../../components/TreePurchaseModal';
import CarbonAllocationModal from '../../components/CarbonAllocationModal';
import PurchaseListModal from '../../components/PurchaseListModal';

// Types from previous implementation
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
  actualEndDate: string | null;
  budget: number;
  actualCost: number;
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
  description: string | null;
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
  data: ProjectDetail;
  errors: any;
  timestamp: string;
  pageInfo: any;
}

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

const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [carbonSummaries, setCarbonSummaries] = useState<
    Map<number, CarbonSummary>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'media'>(
    'overview',
  );

  // Modal states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showPurchaseListModal, setShowPurchaseListModal] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);

  // Fetch project data
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
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json: ApiResponse = await res.json();

        if (!json.success) {
          throw new Error(json.message || 'Failed to load project');
        }

        setProject(json.data);

        // Load carbon summaries for all phases
        const summaries = new Map<number, CarbonSummary>();
        for (const phase of json.data.phases) {
          try {
            const summary = await getCarbonSummary(phase.id);
            summaries.set(phase.id, summary);
          } catch (err) {
            console.error(
              `Failed to load carbon summary for phase ${phase.id}:`,
              err,
            );
          }
        }
        setCarbonSummaries(summaries);
      } catch (err: any) {
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

  const reloadCarbonSummary = async (phaseId: number) => {
    try {
      const summary = await getCarbonSummary(phaseId);
      setCarbonSummaries((prev) => new Map(prev).set(phaseId, summary));
    } catch (err) {
      console.error('Failed to reload carbon summary:', err);
    }
  };

  const handleOpenPurchaseModal = (phaseId: number) => {
    setSelectedPhaseId(phaseId);
    setShowPurchaseModal(true);
  };

  const handleOpenPurchaseListModal = (phaseId: number) => {
    setSelectedPhaseId(phaseId);
    setShowPurchaseListModal(true);
  };

  const handleTransferSurplus = async (phaseId: number) => {
    if (!window.confirm('Bạn có chắc muốn chuyển carbon dư vào quỹ?')) return;

    try {
      const userId = localStorage.getItem('userId') || '';
      const { transferSurplusToReserve } = await import(
        '../../models/treePurchase.api'
      );
      await transferSurplusToReserve(phaseId, userId);
      alert('Chuyển carbon dư thành công!');
      await reloadCarbonSummary(phaseId);
    } catch (err: any) {
      alert(err.message || 'Chuyển carbon dư thất bại');
    }
  };

  // Loading state
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

  // Error state
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

  const totalBudget = project.phases.reduce((sum, p) => sum + p.budget, 0);
  const totalActualCost = project.phases.reduce(
    (sum, p) => sum + p.actualCost,
    0,
  );
  const progressPercent =
    project.targetConsumedCarbon > 0
      ? Math.round(
          (project.currentConsumedCarbon / project.targetConsumedCarbon) * 100,
        )
      : 0;

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Danh sách dự án', href: '/projects' },
            { label: project.name },
          ]}
        />

        {/* Header */}
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
            <button
              onClick={() => setShowAllocationModal(true)}
              className='px-4 py-2 text-yellow-400 bg-[#0E2219] border border-[#1E3A2B] hover:bg-[#13271F] rounded-lg flex items-center gap-2 transition'
            >
              <span className='material-icons text-lg'>swap_horiz</span>
              Phân bổ Carbon
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className='text-gray-300 mb-6 leading-relaxed'>
            {project.description}
          </p>
        )}

        {/* Top Statistics */}
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
              {project.targetConsumedCarbon.toLocaleString()} tấn
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

        {/* Progress Bar */}
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
            {project.currentConsumedCarbon.toLocaleString()} /{' '}
            {project.targetConsumedCarbon.toLocaleString()} tấn CO₂
          </p>
        </div>

        {/* Phases Section */}
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
              {project.phases.map((phase) => {
                const summary = carbonSummaries.get(phase.id);

                return (
                  <div
                    key={phase.id}
                    className='p-5 bg-[#13271F] rounded-lg border border-[#1E3A2B] hover:border-green-500/30 transition'
                  >
                    {/* Phase Header */}
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex-1'>
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

                    {/* Carbon Summary Cards */}
                    {summary && (
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-3'>
                        <div className='p-3 bg-[#0E2219] rounded-lg'>
                          <p className='text-gray-400 text-xs mb-1'>Mục tiêu</p>
                          <p className='font-semibold text-green-400'>
                            {summary.targetCarbon.toLocaleString()} tấn
                          </p>
                        </div>

                        <div className='p-3 bg-[#0E2219] rounded-lg'>
                          <p className='text-gray-400 text-xs mb-1'>Đã mua</p>
                          <p className='font-semibold text-blue-400'>
                            {summary.purchasedCarbon.toLocaleString()} tấn
                          </p>
                        </div>

                        <div className='p-3 bg-[#0E2219] rounded-lg'>
                          <p className='text-gray-400 text-xs mb-1'>Từ quỹ</p>
                          <p className='font-semibold text-purple-400'>
                            {summary.allocatedFromReserve.toLocaleString()} tấn
                          </p>
                        </div>

                        <div className='p-3 bg-[#0E2219] rounded-lg'>
                          <p className='text-gray-400 text-xs mb-1'>
                            {summary.carbonSurplus > 0 ? 'Thừa' : 'Thiếu'}
                          </p>
                          <p
                            className={`font-semibold ${
                              summary.carbonSurplus > 0
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}
                          >
                            {Math.abs(
                              summary.carbonSurplus || summary.carbonDeficit,
                            ).toLocaleString()}{' '}
                            tấn
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {summary && (
                      <div className='mb-3'>
                        <div className='flex justify-between text-xs text-gray-400 mb-1'>
                          <span>Tiến độ carbon</span>
                          <span>
                            {summary.completionPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className='w-full h-2 bg-gray-700 rounded-full overflow-hidden'>
                          <div
                            className='h-2 bg-green-500 rounded-full transition-all'
                            style={{
                              width: `${Math.min(summary.completionPercentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className='flex flex-wrap gap-2'>
                      <button
                        onClick={() => handleOpenPurchaseModal(phase.id)}
                        className='px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                      >
                        <span className='material-icons text-sm'>
                          add_shopping_cart
                        </span>
                        Mua cây
                      </button>

                      <button
                        onClick={() => handleOpenPurchaseListModal(phase.id)}
                        className='px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                      >
                        <span className='material-icons text-sm'>
                          receipt_long
                        </span>
                        Xem đơn ({summary?.purchases.length || 0})
                      </button>

                      {summary && summary.carbonSurplus > 0 && (
                        <button
                          onClick={() => handleTransferSurplus(phase.id)}
                          className='px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                        >
                          <span className='material-icons text-sm'>
                            savings
                          </span>
                          Chuyển vào quỹ
                        </button>
                      )}
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
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showPurchaseModal && selectedPhaseId && (
        <TreePurchaseModal
          phaseId={selectedPhaseId}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={() => {
            setShowPurchaseModal(false);
            reloadCarbonSummary(selectedPhaseId);
          }}
        />
      )}

      {showAllocationModal && (
        <CarbonAllocationModal
          projectPhases={project.phases}
          onClose={() => setShowAllocationModal(false)}
          onSuccess={() => {
            setShowAllocationModal(false);
            // Reload all summaries
            project.phases.forEach((p) => reloadCarbonSummary(p.id));
          }}
        />
      )}

      {showPurchaseListModal && selectedPhaseId && (
        <PurchaseListModal
          phaseId={selectedPhaseId}
          projectManagerId={project?.managerId}
          onClose={() => setShowPurchaseListModal(false)}
          onUpdate={() => reloadCarbonSummary(selectedPhaseId)}
        />
      )}
    </div>
  );
}
