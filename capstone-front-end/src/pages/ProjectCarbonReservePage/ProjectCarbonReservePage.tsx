import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  getProjectCarbonReserve,
  getReserveTransactions,
  type ProjectCarbonReserve,
  type CarbonReserveTransaction,
} from '../../models/carbonReserve.api';

const getStatusColor = (status: 'DEFICIT' | 'BALANCED' | 'SURPLUS') => {
  switch (status) {
    case 'DEFICIT':
      return 'text-red-400 bg-red-900/20 border-red-500';
    case 'BALANCED':
      return 'text-green-400 bg-green-900/20 border-green-500';
    case 'SURPLUS':
      return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'TRANSFER_TO_RESERVE':
      return 'savings';
    case 'ALLOCATE_FROM_RESERVE':
      return 'account_balance';
    case 'PHASE_TO_PHASE':
      return 'swap_horiz';
    default:
      return 'sync_alt';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN');
};

export default function ProjectCarbonReservePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reserve, setReserve] = useState<ProjectCarbonReserve | null>(null);
  const [transactions, setTransactions] = useState<CarbonReserveTransaction[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>(
    'overview',
  );

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [reserveData, transactionsData] = await Promise.all([
          getProjectCarbonReserve(parseInt(id)),
          getReserveTransactions(parseInt(id)).catch(() => []),
        ]);

        setReserve(reserveData);
        setTransactions(transactionsData);
      } catch (err: any) {
        console.error('Error loading carbon reserve:', err);
        setError(err.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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

  if (error || !reserve) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen'>
        <Sidebar />
        <main className='flex-1 p-8'>
          <div className='bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl'>
            <h2 className='text-xl font-bold mb-2'>⚠️ Lỗi</h2>
            <p>{error || 'Không tải được dữ liệu'}</p>
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

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Danh sách dự án', href: '/projects' },
            { label: reserve.projectName, href: `/projects/${id}` },
            { label: 'Quỹ Carbon Dự trữ' },
          ]}
        />

        {/* HEADER */}
        <div className='mb-6'>
          <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
            <span className='material-icons text-yellow-500'>
              account_balance
            </span>
            Tổng Quan Quỹ Carbon Dự Trữ
          </h1>
          <p className='text-gray-400'>
            Theo dõi tình trạng carbon của toàn bộ các giai đoạn trong dự án{' '}
            <span className='text-green-400 font-semibold'>
              {reserve.projectName}
            </span>
          </p>
          <p className='text-xs text-gray-500 font-mono mt-1'>
            {reserve.projectCode}
          </p>
        </div>

        {/* TOP SUMMARY CARDS */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          {/* Total Target */}
          <div className='bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-blue-300 text-sm font-semibold'>
                Tổng mục tiêu
              </p>
              <span className='material-icons text-blue-400'>flag</span>
            </div>
            <p className='text-3xl font-bold text-blue-400'>
              {reserve.totalTargetCarbon.toLocaleString()}
            </p>
            <p className='text-xs text-blue-300 mt-1'>tấn CO₂</p>
          </div>

          {/* Total Acquired */}
          <div className='bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-green-300 text-sm font-semibold'>Đã có được</p>
              <span className='material-icons text-green-400'>
                check_circle
              </span>
            </div>
            <p className='text-3xl font-bold text-green-400'>
              {reserve.totalAcquiredCarbon.toLocaleString()}
            </p>
            <p className='text-xs text-green-300 mt-1'>
              tấn CO₂ ({reserve.overallCompletionPercentage.toFixed(1)}%)
            </p>
          </div>

          {/* Reserve Available */}
          <div className='bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-yellow-300 text-sm font-semibold'>
                Quỹ dự trữ
              </p>
              <span className='material-icons text-yellow-400'>savings</span>
            </div>
            <p className='text-3xl font-bold text-yellow-400'>
              {reserve.reserveAvailable.toLocaleString()}
            </p>
            <p className='text-xs text-yellow-300 mt-1'>tấn CO₂ khả dụng</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl p-6 mb-6'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='font-semibold text-lg'>Tiến độ tổng thể</h3>
            <span className='text-green-400 font-bold text-xl'>
              {reserve.overallCompletionPercentage.toFixed(1)}%
            </span>
          </div>
          <div className='w-full h-6 bg-gray-700 rounded-full overflow-hidden'>
            <div
              className='h-6 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 rounded-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-black'
              style={{
                width: `${Math.min(reserve.overallCompletionPercentage, 100)}%`,
              }}
            >
              {reserve.overallCompletionPercentage > 10 &&
                `${reserve.totalAcquiredCarbon.toLocaleString()} / ${reserve.totalTargetCarbon.toLocaleString()} tấn`}
            </div>
          </div>
          <div className='flex justify-between text-xs text-gray-400 mt-2'>
            <span>
              Đã mua: {reserve.totalPurchasedCarbon.toLocaleString()} tấn
            </span>
            <span>
              Từ quỹ: {reserve.totalAllocatedFromReserve.toLocaleString()} tấn
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl overflow-hidden'>
          <div className='flex border-b border-[#1E3A2B]'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-[#13271F] text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white hover:bg-[#0A1812]'
              }`}
            >
              <span className='material-icons text-sm mr-2'>dashboard</span>
              Chi tiết các Phase
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'transactions'
                  ? 'bg-[#13271F] text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white hover:bg-[#0A1812]'
              }`}
            >
              <span className='material-icons text-sm mr-2'>history</span>
              Lịch sử giao dịch ({transactions.length})
            </button>
          </div>

          <div className='p-6'>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className='space-y-4'>
                {reserve.phases.map((phase) => (
                  <div
                    key={phase.phaseId}
                    className={`p-5 rounded-lg border-2 transition hover:shadow-lg ${getStatusColor(
                      phase.status,
                    )}`}
                  >
                    {/* Phase Header */}
                    <div className='flex justify-between items-start mb-4'>
                      <div className='flex items-center gap-3'>
                        <span className='px-3 py-1 bg-white/10 text-white text-sm font-bold rounded'>
                          #{phase.phaseOrder}
                        </span>
                        <div>
                          <h4 className='font-bold text-lg text-white'>
                            {phase.phaseName}
                          </h4>
                          <p className='text-xs opacity-80'>
                            Trạng thái:{' '}
                            {phase.status === 'DEFICIT'
                              ? '❌ Thiếu'
                              : phase.status === 'SURPLUS'
                                ? '✅ Thừa'
                                : '⚖️ Cân bằng'}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-2xl font-bold'>
                          {phase.completionPercentage.toFixed(1)}%
                        </p>
                        <p className='text-xs opacity-80'>Tiến độ</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className='mb-4'>
                      <div className='w-full h-3 bg-black/20 rounded-full overflow-hidden'>
                        <div
                          className='h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all'
                          style={{
                            width: `${Math.min(phase.completionPercentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
                      <div className='p-3 bg-black/20 rounded-lg'>
                        <p className='text-xs opacity-70 mb-1'>Mục tiêu</p>
                        <p className='font-semibold text-white'>
                          {phase.targetCarbon.toLocaleString()} tấn
                        </p>
                      </div>
                      <div className='p-3 bg-black/20 rounded-lg'>
                        <p className='text-xs opacity-70 mb-1'>Đã mua</p>
                        <p className='font-semibold text-blue-300'>
                          {phase.purchasedCarbon.toLocaleString()} tấn
                        </p>
                      </div>
                      <div className='p-3 bg-black/20 rounded-lg'>
                        <p className='text-xs opacity-70 mb-1'>Từ quỹ</p>
                        <p className='font-semibold text-purple-300'>
                          {phase.allocatedFromReserve.toLocaleString()} tấn
                        </p>
                      </div>
                      <div className='p-3 bg-black/20 rounded-lg'>
                        <p className='text-xs opacity-70 mb-1'>
                          {phase.carbonSurplus > 0 ? 'Thừa' : 'Thiếu'}
                        </p>
                        <p
                          className={`font-bold ${
                            phase.carbonSurplus > 0
                              ? 'text-yellow-300'
                              : 'text-red-300'
                          }`}
                        >
                          {Math.abs(
                            phase.carbonSurplus || phase.carbonDeficit,
                          ).toLocaleString()}{' '}
                          tấn
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className='space-y-3'>
                {transactions.length === 0 ? (
                  <div className='text-center py-12 text-gray-400'>
                    <span className='material-icons text-5xl mb-2 opacity-30'>
                      receipt_long
                    </span>
                    <p>Chưa có giao dịch nào</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className='p-4 bg-[#071811] rounded-lg border border-[#1E3A2B] hover:border-green-500/30 transition'
                    >
                      <div className='flex items-start gap-4'>
                        <div className='p-3 bg-green-500/10 rounded-lg'>
                          <span className='material-icons text-green-400'>
                            {getTransactionIcon(tx.transactionType)}
                          </span>
                        </div>

                        <div className='flex-1'>
                          <div className='flex justify-between items-start mb-2'>
                            <div>
                              <h4 className='font-semibold text-white mb-1'>
                                {tx.transactionType === 'TRANSFER_TO_RESERVE' &&
                                  '💰 Chuyển vào quỹ dự trữ'}
                                {tx.transactionType ===
                                  'ALLOCATE_FROM_RESERVE' &&
                                  '📤 Phân bổ từ quỹ'}
                                {tx.transactionType === 'PHASE_TO_PHASE' &&
                                  '🔄 Chuyển giữa các Phase'}
                              </h4>
                              <p className='text-xs text-gray-400'>
                                {formatDate(tx.createdAt)} • ID: #{tx.id}
                              </p>
                            </div>
                            <span className='text-xl font-bold text-yellow-400'>
                              {tx.carbonAmount.toLocaleString()} tấn
                            </span>
                          </div>

                          <div className='flex items-center gap-3 text-sm mb-2'>
                            {tx.sourcePhaseName && (
                              <span className='px-2 py-1 bg-blue-500/20 text-blue-300 rounded'>
                                Từ: {tx.sourcePhaseName}
                              </span>
                            )}
                            {tx.targetPhaseName && (
                              <span className='px-2 py-1 bg-purple-500/20 text-purple-300 rounded'>
                                Đến: {tx.targetPhaseName}
                              </span>
                            )}
                          </div>

                          {tx.notes && (
                            <p className='text-sm text-gray-300 bg-yellow-500/10 border border-yellow-500/30 rounded p-2'>
                              📝 {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
