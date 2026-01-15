import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  getContractById,
  terminateContract,
  type Contract,
} from '../../models/contract.api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function ContractTerminatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [terminationReason, setTerminationReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [acknowledgeChecked, setAcknowledgeChecked] = useState(false);

  useEffect(() => {
    loadContract();
  }, [id]);

  const loadContract = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getContractById(Number(id));

      if (!response.success || !response.data) {
        throw new Error('Không tìm thấy hợp đồng');
      }

      if (response.data.contractStatus !== 'ACTIVE') {
        throw new Error('Chỉ có thể chấm dứt hợp đồng đang hoạt động');
      }

      setContract(response.data);
    } catch (err: any) {
      console.error('Error loading contract:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!contract) return;

    if (!terminationReason.trim()) {
      setError('Vui lòng nhập lý do chấm dứt hợp đồng');
      return;
    }

    if (terminationReason.trim().length < 10) {
      setError('Lý do chấm dứt phải có ít nhất 10 ký tự');
      return;
    }

    if (!acknowledgeChecked) {
      setError('Vui lòng xác nhận bạn hiểu hậu quả của việc chấm dứt hợp đồng');
      return;
    }

    if (confirmText !== contract.contractCode) {
      setError(`Vui lòng nhập chính xác mã hợp đồng: ${contract.contractCode}`);
      return;
    }

    if (
      !window.confirm(
        '⚠️ BẠN CÓ CHẮC CHẮN MUỐN CHẤM DỨT HỢP ĐỒNG NÀY?  Hành động này không thể hoàn tác!',
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      await terminateContract(contract.id, {
        terminationReason: terminationReason.trim(),
        terminatedBy: userId,
      });

      alert('Hợp đồng đã được chấm dứt thành công!');
      navigate(`/contracts/${contract.id}`);
    } catch (err: any) {
      console.error('Termination failed:', err);
      setError(err.message || 'Chấm dứt hợp đồng thất bại');
    } finally {
      setSubmitting(false);
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
              Quay lại
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
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý hợp đồng', href: '/contracts' },
            { label: contract.contractCode, href: `/contracts/${contract.id}` },
            { label: 'Chấm dứt hợp đồng' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <span className='material-icons text-red-500 text-4xl'>cancel</span>
          Chấm dứt Hợp đồng
        </h1>
        <p className='text-gray-400 mb-8'>
          Chấm dứt trước hạn hợp đồng{' '}
          <span className='text-red-400 font-mono'>
            {contract.contractCode}
          </span>
        </p>

        {/* WARNING BANNER */}
        <div className='bg-red-900/30 border-2 border-red-500 p-6 rounded-xl mb-6'>
          <div className='flex items-start gap-4'>
            <span className='material-icons text-red-500 text-5xl'>
              warning
            </span>
            <div>
              <h2 className='text-2xl font-bold text-red-400 mb-2'>
                ⚠️ CẢNH BÁO QUAN TRỌNG
              </h2>
              <ul className='space-y-2 text-red-200'>
                <li className='flex items-start gap-2'>
                  <span className='material-icons text-sm mt-0.5'>
                    arrow_right
                  </span>
                  <span>
                    Hành động này sẽ <strong>CHẤM DỨT NGAY LẬP TỨC</strong> hiệu
                    lực của hợp đồng
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='material-icons text-sm mt-0.5'>
                    arrow_right
                  </span>
                  <span>
                    Hợp đồng <strong>KHÔNG THỂ KHÔI PHỤC</strong> sau khi chấm
                    dứt
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='material-icons text-sm mt-0.5'>
                    arrow_right
                  </span>
                  <span>
                    Có thể phát sinh <strong>PHÍ CHẤM DỨT SỚM</strong>
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='material-icons text-sm mt-0.5'>
                    arrow_right
                  </span>
                  <span>
                    Tất cả các quyền lợi và nghĩa vụ sẽ{' '}
                    <strong>KẾT THÚC NGAY</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CONTRACT INFO */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-blue-500'>description</span>
            Thông tin hợp đồng
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Dự án</p>
              <p className='font-semibold text-lg'>{contract.projectName}</p>
            </div>

            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Giá trị hợp đồng</p>
              <p className='font-semibold text-2xl text-yellow-400'>
                {formatCurrency(contract.totalAmount)}
              </p>
            </div>

            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Thời hạn còn lại</p>
              <p className='font-semibold text-lg'>
                {contract.daysUntilExpiry !== null
                  ? `${contract.daysUntilExpiry} ngày`
                  : 'N/A'}
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Đến {formatDate(contract.endDate)}
              </p>
            </div>

            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Phí chấm dứt sớm</p>
              <p className='font-semibold text-lg text-red-400'>
                {contract.earlyTerminationPenalty
                  ? formatCurrency(contract.earlyTerminationPenalty)
                  : 'Không có'}
              </p>
            </div>
          </div>
        </div>

        {/* TERMINATION FORM */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-orange-500'>edit_note</span>
            Lý do chấm dứt
          </h2>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Lý do chấm dứt hợp đồng <span className='text-red-400'>*</span>
              </label>
              <textarea
                rows={6}
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white placeholder-gray-500 focus:outline-none focus: ring-2 focus:ring-red-500'
                placeholder='Nhập lý do chi tiết về việc chấm dứt hợp đồng trước hạn...  (Tối thiểu 10 ký tự)'
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
              />
              <p className='text-xs text-gray-400 mt-1'>
                Đã nhập: {terminationReason.length} ký tự
              </p>
            </div>

            <div className='p-4 bg-red-500/10 border border-red-500/30 rounded-lg'>
              <label className='flex items-start gap-3 cursor-pointer'>
                <input
                  type='checkbox'
                  className='w-5 h-5 mt-0.5 rounded text-red-500 focus:ring-red-500'
                  checked={acknowledgeChecked}
                  onChange={(e) => setAcknowledgeChecked(e.target.checked)}
                />
                <div>
                  <p className='font-semibold text-red-400'>
                    Tôi hiểu và chấp nhận hậu quả
                  </p>
                  <p className='text-sm text-gray-300 mt-1'>
                    Tôi xác nhận đã đọc và hiểu rõ các cảnh báo ở trên. Tôi chấp
                    nhận chịu trách nhiệm về quyết định chấm dứt hợp đồng này.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Xác nhận mã hợp đồng <span className='text-red-400'>*</span>
              </label>
              <p className='text-xs text-gray-400 mb-2'>
                Để xác nhận, vui lòng nhập mã hợp đồng:{' '}
                <strong className='text-red-400'>
                  {contract.contractCode}
                </strong>
              </p>
              <input
                type='text'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500'
                placeholder={contract.contractCode}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={() => navigate(`/contracts/${contract.id}`)}
            className='px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition'
            disabled={submitting}
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className='px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={
              submitting ||
              !terminationReason.trim() ||
              terminationReason.trim().length < 10 ||
              !acknowledgeChecked ||
              confirmText !== contract.contractCode
            }
          >
            {submitting ? (
              <>
                <div className='inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <span className='material-icons'>cancel</span>
                Chấm dứt hợp đồng
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
