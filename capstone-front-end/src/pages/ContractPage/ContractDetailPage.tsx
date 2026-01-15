import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useContractDetailViewModel } from '../../viewmodels/useContractViewModel';
import {
  submitContract,
  approveContract,
  requestRenewal,
  terminateContract,
  deleteContract,
} from '../../models/contract.api';

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function ContractDetailPage() {
  const navigate = useNavigate();
  const { contract, loading, error, reload } = useContractDetailViewModel();

  const [actionLoading, setActionLoading] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  const handleSubmit = async () => {
    if (!contract) return;
    if (!window.confirm('Bạn có chắc muốn gửi hợp đồng này để phê duyệt?'))
      return;

    try {
      setActionLoading(true);
      await submitContract(contract.id);
      alert('Gửi phê duyệt thành công!');
      reload();
    } catch (err: any) {
      alert(err.message || 'Gửi phê duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!contract) return;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Không tìm thấy thông tin người dùng');
      return;
    }

    const notes = window.prompt('Ghi chú phê duyệt (tùy chọn):');
    if (notes === null) return; // User cancelled

    try {
      setActionLoading(true);
      await approveContract(contract.id, {
        approvedBy: userId,
        notes: notes || undefined,
      });
      alert('Phê duyệt thành công!');
      reload();
    } catch (err: any) {
      alert(err.message || 'Phê duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!contract) return;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Không tìm thấy thông tin người dùng');
      return;
    }

    const renewalYears = window.prompt('Số năm gia hạn:', '3');
    if (!renewalYears) return;

    const renewalAmount = window.prompt(
      'Giá trị gia hạn (VND):',
      contract.totalAmount.toString(),
    );
    if (!renewalAmount) return;

    const notes = window.prompt('Ghi chú (tùy chọn):');

    try {
      setActionLoading(true);
      await requestRenewal({
        contractId: contract.id,
        renewalTermYears: parseInt(renewalYears),
        renewalAmount: parseFloat(renewalAmount),
        notes: notes || undefined,
        requestedBy: userId,
      });
      alert('Yêu cầu gia hạn thành công!');
      reload();
    } catch (err: any) {
      alert(err.message || 'Yêu cầu gia hạn thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!contract) return;
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Không tìm thấy thông tin người dùng');
      return;
    }

    const reason = window.prompt('Lý do chấm dứt hợp đồng: ');
    if (!reason || !reason.trim()) {
      alert('Vui lòng nhập lý do chấm dứt');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn chấm dứt hợp đồng này?')) return;

    try {
      setActionLoading(true);
      await terminateContract(contract.id, {
        terminationReason: reason,
        terminatedBy: userId,
      });
      alert('Chấm dứt hợp đồng thành công!');
      reload();
    } catch (err: any) {
      alert(err.message || 'Chấm dứt hợp đồng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contract) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này? ')) return;

    try {
      await deleteContract(contract.id);
      alert('Xóa thành công!');
      navigate('/contracts');
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

  if (error || !contract) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen'>
        <Sidebar />
        <main className='flex-1 p-8'>
          <div className='bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl'>
            <h2 className='text-xl font-bold mb-2'>⚠️ Lỗi</h2>
            <p>{error || 'Không tìm thấy hợp đồng'}</p>
            <button
              onClick={() => navigate('/contracts')}
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
            { label: 'Quản lý hợp đồng', href: '/contracts' },
            { label: contract.contractCode },
          ]}
        />

        {/* HEADER */}
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Chi tiết Hợp đồng</h1>
            <div className='flex items-center gap-3'>
              <span className='text-gray-400 font-mono text-lg'>
                {contract.contractCode}
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(
                  contract.contractStatus,
                )}`}
              >
                {contract.contractStatus}
              </span>
              {contract.isExpiringSoon && (
                <span className='px-3 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500'>
                  ⚠️ Sắp hết hạn
                </span>
              )}
            </div>
          </div>

          <div className='flex gap-3'>
            {contract.contractStatus === 'DRAFT' && (
              <>
                <button
                  onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                  className='px-4 py-2 bg-blue-500 hover: bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2'
                  disabled={actionLoading}
                >
                  <span className='material-icons text-lg'>edit</span>
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleSubmit}
                  className='px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-2'
                  disabled={actionLoading}
                >
                  <span className='material-icons text-lg'>send</span>
                  Gửi phê duyệt
                </button>
              </>
            )}

            {contract.contractStatus === 'PENDING' && (
              <button
                onClick={handleApprove}
                className='px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold flex items-center gap-2'
                disabled={actionLoading}
              >
                <span className='material-icons text-lg'>check_circle</span>
                Phê duyệt
              </button>
            )}

            {contract.contractStatus === 'ACTIVE' && (
              <>
                {contract.canRenew && (
                  <button
                    onClick={handleRenew}
                    className='px-4 py-2 bg-blue-500 hover: bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2'
                    disabled={actionLoading}
                  >
                    <span className='material-icons text-lg'>autorenew</span>
                    Gia hạn
                  </button>
                )}
                <button
                  onClick={handleTerminate}
                  className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold flex items-center gap-2'
                  disabled={actionLoading}
                >
                  <span className='material-icons text-lg'>cancel</span>
                  Chấm dứt
                </button>
              </>
            )}

            <button
              onClick={handleDelete}
              className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2'
            >
              <span className='material-icons text-lg'>delete</span>
              Xóa
            </button>
          </div>
        </div>

        {/* PROJECT INFO */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h3 className='font-semibold text-xl mb-4 flex items-center gap-2'>
            <span className='material-icons text-blue-500'>folder</span>
            Thông tin dự án
          </h3>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-gray-400 mb-1'>Tên dự án</p>
              <p className='text-white font-semibold'>{contract.projectName}</p>
            </div>
            <div>
              <p className='text-gray-400 mb-1'>Mã dự án</p>
              <p className='text-white font-mono'>{contract.projectCode}</p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className='grid grid-cols-1 md: grid-cols-4 gap-4 mb-6'>
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Tổng giá trị</p>
              <span className='material-icons text-yellow-500'>payments</span>
            </div>
            <p className='text-2xl font-bold text-yellow-400'>
              {formatCurrency(contract.totalAmount)}
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Thời hạn</p>
              <span className='material-icons text-blue-500'>schedule</span>
            </div>
            <p className='text-2xl font-bold text-blue-400'>
              {contract.contractTermYears} năm
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Còn lại</p>
              <span className='material-icons text-green-500'>
                hourglass_bottom
              </span>
            </div>
            <p className='text-2xl font-bold text-green-400'>
              {contract.daysUntilExpiry !== null
                ? `${contract.daysUntilExpiry} ngày`
                : '—'}
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Số lần gia hạn</p>
              <span className='material-icons text-purple-500'>refresh</span>
            </div>
            <p className='text-2xl font-bold text-purple-400'>
              {contract.renewalCount} / {contract.maxRenewals || '∞'}
            </p>
          </div>
        </div>

        {/* CONTRACT DETAILS */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* LEFT COLUMN */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
              <span className='material-icons text-green-500'>description</span>
              Chi tiết hợp đồng
            </h3>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Phân loại: </span>
                <span className='text-gray-200'>
                  {contract.contractCategory === 'ENTERPRISE_PROJECT'
                    ? 'Dự án doanh nghiệp'
                    : 'Cây cá nhân'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Loại hợp đồng: </span>
                <span className='text-gray-200'>
                  {contract.contractType === 'OWNERSHIP' ? 'Sở hữu' : 'Dịch vụ'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Đơn giá:</span>
                <span className='text-gray-200'>
                  {formatCurrency(contract.unitPrice)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Ngày bắt đầu:</span>
                <span className='text-gray-200'>
                  {formatDate(contract.startDate)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Ngày kết thúc:</span>
                <span className='text-gray-200'>
                  {formatDate(contract.endDate)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Tự động gia hạn:</span>
                <span className='text-gray-200'>
                  {contract.autoRenewal ? 'Có' : 'Không'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
              <span className='material-icons text-purple-500'>gavel</span>
              Quyền lợi & Điều khoản
            </h3>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Quyền thu hoạch:</span>
                <span className='text-gray-200'>
                  {contract.harvestRights ? 'Có' : 'Không'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Cho phép chuyển nhượng:</span>
                <span className='text-gray-200'>
                  {contract.transferAllowed ? 'Có' : 'Không'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Phí chấm dứt sớm:</span>
                <span className='text-gray-200'>
                  {contract.earlyTerminationPenalty
                    ? formatCurrency(contract.earlyTerminationPenalty)
                    : '—'}
                </span>
              </div>
              {contract.terminatedAt && (
                <>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Ngày chấm dứt:</span>
                    <span className='text-red-400'>
                      {formatDate(contract.terminatedAt)}
                    </span>
                  </div>
                  {contract.terminationReason && (
                    <div>
                      <span className='text-gray-400'>Lý do: </span>
                      <p className='text-red-300 mt-1'>
                        {contract.terminationReason}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONTRACT CONTENT */}
        {contract.content && (
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
            <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
              <span className='material-icons text-yellow-500'>article</span>
              Nội dung hợp đồng
            </h3>
            <div className='grid grid-cols-1 md: grid-cols-3 gap-4 mb-4 text-sm'>
              {contract.content.treeCount !== undefined && (
                <div className='p-3 bg-[#071811] rounded-lg'>
                  <p className='text-gray-400 text-xs mb-1'>Số lượng cây</p>
                  <p className='font-semibold text-white text-lg'>
                    {contract.content.treeCount.toLocaleString()}
                  </p>
                </div>
              )}
              {contract.content.carbonPercentage !== undefined && (
                <div className='p-3 bg-[#071811] rounded-lg'>
                  <p className='text-gray-400 text-xs mb-1'>% Tín chỉ Carbon</p>
                  <p className='font-semibold text-green-400 text-lg'>
                    {contract.content.carbonPercentage}%
                  </p>
                </div>
              )}
            </div>

            {contract.content.benefits &&
              contract.content.benefits.length > 0 && (
                <div>
                  <p className='text-gray-400 text-sm mb-2'>Quyền lợi:</p>
                  <ul className='space-y-2'>
                    {contract.content.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className='flex items-start gap-2 text-gray-200'
                      >
                        <span className='material-icons text-green-500 text-sm mt-0.5'>
                          check_circle
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* NOTES */}
        {contract.notes && (
          <div className='bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl mb-6'>
            <h3 className='font-semibold text-lg mb-2 flex items-center gap-2 text-yellow-400'>
              <span className='material-icons'>note</span>
              Ghi chú
            </h3>
            <p className='text-gray-200 whitespace-pre-wrap'>
              {contract.notes}
            </p>
          </div>
        )}

        {/* APPROVAL INFO */}
        {contract.approvedBy && (
          <div className='bg-green-500/10 border border-green-500/30 p-6 rounded-xl mb-6'>
            <h3 className='font-semibold text-lg mb-2 flex items-center gap-2 text-green-400'>
              <span className='material-icons'>verified</span>
              Thông tin phê duyệt
            </h3>
            <div className='text-sm text-gray-200'>
              <p>Người phê duyệt: {contract.approvedBy}</p>
              <p>Ngày phê duyệt: {formatDate(contract.approvedAt)}</p>
            </div>
          </div>
        )}

        {/* METADATA */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h3 className='font-semibold text-lg mb-4 flex items-center gap-2'>
            <span className='material-icons text-gray-500'>info</span>
            Metadata
          </h3>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-gray-400 mb-1'>Ngày tạo</p>
              <p className='text-gray-200'>{formatDate(contract.createdAt)}</p>
            </div>
            <div>
              <p className='text-gray-400 mb-1'>Cập nhật lần cuối</p>
              <p className='text-gray-200'>{formatDate(contract.updatedAt)}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
