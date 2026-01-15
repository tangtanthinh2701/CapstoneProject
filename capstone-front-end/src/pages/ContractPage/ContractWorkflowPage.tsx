import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getContractList, type Contract } from '../../models/contract.api';

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border border-gray-300';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'EXPIRED':
      return 'bg-orange-100 text-orange-800 border border-orange-300';
    case 'TERMINATED':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function ContractWorkflowPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'pending' | 'expiring' | 'renewal'
  >('pending');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getContractList({ size: 1000 });

      if (response.success && response.data) {
        setContracts(response.data);
      } else {
        throw new Error('Không tải được danh sách hợp đồng');
      }
    } catch (err: any) {
      console.error('Error loading contracts:', err);
      setError(err.message || 'Không tải được danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  // Filter contracts by status
  const pendingContracts = contracts.filter(
    (c) => c.contractStatus === 'PENDING',
  );
  const expiringContracts = contracts.filter(
    (c) => c.isExpiringSoon && c.contractStatus === 'ACTIVE',
  );
  const activeRenewableContracts = contracts.filter(
    (c) => c.contractStatus === 'ACTIVE' && c.canRenew,
  );

  const getTabContracts = () => {
    switch (activeTab) {
      case 'pending':
        return pendingContracts;
      case 'expiring':
        return expiringContracts;
      case 'renewal':
        return activeRenewableContracts;
      default:
        return [];
    }
  };

  const tabContracts = getTabContracts();

  return (
    <div className='flex bg-[#07150D] min-h-screen text-white'>
      <Sidebar />

      <main className='flex-1 p-8'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý hợp đồng', href: '/contracts' },
            { label: 'Quy trình xử lý' },
          ]}
        />

        {/* HEADER */}
        <div className='mb-6'>
          <h1 className='text-3xl font-bold mb-2'>Quy trình xử lý Hợp đồng</h1>
          <p className='text-gray-400'>
            Quản lý các hợp đồng cần phê duyệt, sắp hết hạn và có thể gia hạn.
          </p>
        </div>

        {/* STATS CARDS */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div
            className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] cursor-pointer hover:border-yellow-500/50 transition'
            onClick={() => setActiveTab('pending')}
          >
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Chờ phê duyệt</p>
              <span className='material-icons text-yellow-500'>
                pending_actions
              </span>
            </div>
            <p className='text-4xl font-bold text-yellow-400'>
              {pendingContracts.length}
            </p>
            <p className='text-xs text-gray-400 mt-2'>Hợp đồng cần duyệt</p>
          </div>

          <div
            className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] cursor-pointer hover:border-orange-500/50 transition'
            onClick={() => setActiveTab('expiring')}
          >
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Sắp hết hạn</p>
              <span className='material-icons text-orange-500'>warning</span>
            </div>
            <p className='text-4xl font-bold text-orange-400'>
              {expiringContracts.length}
            </p>
            <p className='text-xs text-gray-400 mt-2'>Cần xem xét gia hạn</p>
          </div>

          <div
            className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] cursor-pointer hover: border-blue-500/50 transition'
            onClick={() => setActiveTab('renewal')}
          >
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Có thể gia hạn</p>
              <span className='material-icons text-blue-500'>autorenew</span>
            </div>
            <p className='text-4xl font-bold text-blue-400'>
              {activeRenewableContracts.length}
            </p>
            <p className='text-xs text-gray-400 mt-2'>Đủ điều kiện</p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* TABS */}
        <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl overflow-hidden'>
          <div className='flex border-b border-[#1E3A2B]'>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-[#13271F] text-yellow-400 border-b-2 border-yellow-500'
                  : 'text-gray-400 hover:text-white hover:bg-[#0A1812]'
              }`}
            >
              <span className='material-icons text-sm'>pending_actions</span>
              Chờ phê duyệt ({pendingContracts.length})
            </button>

            <button
              onClick={() => setActiveTab('expiring')}
              className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'expiring'
                  ? 'bg-[#13271F] text-orange-400 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover: bg-[#0A1812]'
              }`}
            >
              <span className='material-icons text-sm'>warning</span>
              Sắp hết hạn ({expiringContracts.length})
            </button>

            <button
              onClick={() => setActiveTab('renewal')}
              className={`flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'renewal'
                  ? 'bg-[#13271F] text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-[#0A1812]'
              }`}
            >
              <span className='material-icons text-sm'>autorenew</span>
              Có thể gia hạn ({activeRenewableContracts.length})
            </button>
          </div>

          <div className='p-6'>
            {loading ? (
              <div className='text-center py-12 text-gray-400'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2'></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : tabContracts.length === 0 ? (
              <div className='text-center py-12 text-gray-400'>
                <span className='material-icons text-5xl mb-2 opacity-30'>
                  inbox
                </span>
                <p>
                  {activeTab === 'pending' &&
                    'Không có hợp đồng nào cần phê duyệt'}
                  {activeTab === 'expiring' &&
                    'Không có hợp đồng nào sắp hết hạn'}
                  {activeTab === 'renewal' &&
                    'Không có hợp đồng nào có thể gia hạn'}
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {tabContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className='p-5 bg-[#071811] rounded-lg border border-[#1E3A2B] hover:border-green-500/30 transition cursor-pointer'
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    {/* HEADER */}
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded'>
                            {contract.contractCode}
                          </span>
                          <h4 className='font-bold text-lg text-white'>
                            {contract.projectName}
                          </h4>
                        </div>
                        <p className='text-sm text-gray-400'>
                          {contract.projectCode}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(
                          contract.contractStatus,
                        )}`}
                      >
                        {contract.contractStatus}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm'>
                      <div>
                        <p className='text-gray-400 text-xs mb-1'>
                          Loại hợp đồng
                        </p>
                        <p className='font-semibold text-white'>
                          {contract.contractType === 'OWNERSHIP'
                            ? 'Sở hữu'
                            : 'Dịch vụ'}
                        </p>
                      </div>

                      <div>
                        <p className='text-gray-400 text-xs mb-1'>Thời hạn</p>
                        <p className='font-semibold text-white'>
                          {contract.contractTermYears} năm
                        </p>
                      </div>

                      <div>
                        <p className='text-gray-400 text-xs mb-1'>
                          Ngày kết thúc
                        </p>
                        <p className='font-semibold text-white'>
                          {formatDate(contract.endDate)}
                        </p>
                      </div>

                      <div>
                        <p className='text-gray-400 text-xs mb-1'>
                          {activeTab === 'expiring' || activeTab === 'renewal'
                            ? 'Còn lại'
                            : 'Giá trị'}
                        </p>
                        <p
                          className={`font-semibold ${
                            activeTab === 'expiring' || activeTab === 'renewal'
                              ? 'text-orange-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {activeTab === 'expiring' || activeTab === 'renewal'
                            ? `${contract.daysUntilExpiry} ngày`
                            : `${(contract.totalAmount / 1000000000).toFixed(1)}B VND`}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className='flex gap-2 pt-3 border-t border-[#1E3A2B]'>
                      {activeTab === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/contracts/${contract.id}/approve`);
                            }}
                            className='px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                          >
                            <span className='material-icons text-sm'>
                              check_circle
                            </span>
                            Phê duyệt
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/contracts/${contract.id}`);
                            }}
                            className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                          >
                            <span className='material-icons text-sm'>
                              visibility
                            </span>
                            Xem chi tiết
                          </button>
                        </>
                      )}

                      {activeTab === 'expiring' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/contracts/${contract.id}/renew`);
                            }}
                            className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                          >
                            <span className='material-icons text-sm'>
                              autorenew
                            </span>
                            Yêu cầu gia hạn
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/contracts/${contract.id}`);
                            }}
                            className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                          >
                            <span className='material-icons text-sm'>
                              visibility
                            </span>
                            Xem chi tiết
                          </button>
                        </>
                      )}

                      {activeTab === 'renewal' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/contracts/${contract.id}/renew`);
                            }}
                            className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                          >
                            <span className='material-icons text-sm'>
                              autorenew
                            </span>
                            Gia hạn ngay
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/contracts/${contract.id}`);
                            }}
                            className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition'
                          >
                            <span className='material-icons text-sm'>
                              visibility
                            </span>
                            Xem chi tiết
                          </button>
                        </>
                      )}
                    </div>

                    {/* WARNING */}
                    {contract.isExpiringSoon && (
                      <div className='mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-300 flex items-center gap-2'>
                        <span className='material-icons text-sm'>warning</span>
                        Hợp đồng sắp hết hạn trong {
                          contract.daysUntilExpiry
                        }{' '}
                        ngày
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
