import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  getContractById,
  requestRenewal,
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

const calculateNewEndDate = (startDate: string, years: number): string => {
  const date = new Date(startDate);
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split('T')[0];
};

export default function ContractRenewalPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [renewalYears, setRenewalYears] = useState(3);
  const [renewalAmount, setRenewalAmount] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadContract();
  }, [id]);

  useEffect(() => {
    if (contract) {
      // Auto-fill with suggested values
      setRenewalYears(contract.renewalTermYears || 3);
      setRenewalAmount(contract.totalAmount); // Same as original
    }
  }, [contract]);

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
        throw new Error('Chỉ có thể gia hạn hợp đồng đang hoạt động');
      }

      if (!response.data.canRenew) {
        throw new Error('Hợp đồng này không thể gia hạn');
      }

      setContract(response.data);
    } catch (err: any) {
      console.error('Error loading contract:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const newStartDate = contract ? contract.endDate : '';
  const newEndDate = contract
    ? calculateNewEndDate(contract.endDate, renewalYears)
    : '';
  const totalRenewals = contract ? contract.renewalCount + 1 : 0;
  const maxReached =
    contract && contract.maxRenewals
      ? totalRenewals > contract.maxRenewals
      : false;

  const handleSubmit = async () => {
    if (!contract) return;

    if (renewalYears < 1) {
      setError('Thời hạn gia hạn phải ít nhất 1 năm');
      return;
    }

    if (renewalAmount <= 0) {
      setError('Giá trị gia hạn phải lớn hơn 0');
      return;
    }

    if (maxReached) {
      setError('Hợp đồng đã đạt số lần gia hạn tối đa');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn gửi yêu cầu gia hạn hợp đồng này?'))
      return;

    try {
      setSubmitting(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      await requestRenewal({
        contractId: contract.id,
        renewalTermYears: renewalYears,
        renewalAmount,
        notes: notes || undefined,
        requestedBy: userId,
      });

      alert('Yêu cầu gia hạn đã được gửi thành công!');
      navigate(`/contracts/${contract.id}`);
    } catch (err: any) {
      console.error('Renewal failed:', err);
      setError(err.message || 'Yêu cầu gia hạn thất bại');
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
              onClick={() => navigate('/contracts/workflow')}
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

      <main className='flex-1 p-8 max-w-5xl mx-auto'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý hợp đồng', href: '/contracts' },
            { label: contract.contractCode, href: `/contracts/${contract.id}` },
            { label: 'Yêu cầu gia hạn' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <span className='material-icons text-blue-500 text-4xl'>
            autorenew
          </span>
          Yêu cầu Gia hạn Hợp đồng
        </h1>
        <p className='text-gray-400 mb-8'>
          Gia hạn hợp đồng{' '}
          <span className='text-blue-400 font-mono'>
            {contract.contractCode}
          </span>
        </p>

        {/* CURRENT CONTRACT INFO */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-green-500'>description</span>
            Thông tin hợp đồng hiện tại
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Dự án</p>
              <p className='font-semibold text-lg'>{contract.projectName}</p>
              <p className='text-xs text-gray-400 mt-1'>
                {contract.projectCode}
              </p>
            </div>

            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Giá trị hiện tại</p>
              <p className='font-semibold text-2xl text-yellow-400'>
                {formatCurrency(contract.totalAmount)}
              </p>
            </div>

            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Thời hạn hiện tại</p>
              <p className='font-semibold text-lg'>
                {contract.contractTermYears} năm
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                {formatDate(contract.startDate)} -{' '}
                {formatDate(contract.endDate)}
              </p>
            </div>

            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Số lần đã gia hạn</p>
              <p className='font-semibold text-lg'>
                {contract.renewalCount} / {contract.maxRenewals || '∞'}
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                {contract.autoRenewal ? 'Tự động gia hạn' : 'Gia hạn thủ công'}
              </p>
            </div>
          </div>

          {contract.daysUntilExpiry !== null && (
            <div className='mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center gap-3'>
              <span className='material-icons text-orange-500 text-3xl'>
                schedule
              </span>
              <div>
                <p className='font-semibold text-orange-400'>
                  Còn {contract.daysUntilExpiry} ngày đến hết hạn
                </p>
                <p className='text-sm text-gray-300'>
                  Hợp đồng sẽ hết hiệu lực vào ngày{' '}
                  {formatDate(contract.endDate)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RENEWAL FORM */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-blue-500'>settings</span>
            Thông tin gia hạn
          </h2>

          <div className='space-y-4'>
            {/* RENEWAL TERM */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Thời hạn gia hạn (năm) <span className='text-red-400'>*</span>
              </label>
              <input
                type='number'
                min='1'
                max='10'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={renewalYears}
                onChange={(e) => setRenewalYears(parseInt(e.target.value) || 1)}
              />
              <p className='text-xs text-gray-400 mt-1'>
                Khuyến nghị: {contract.renewalTermYears || 3} năm
              </p>
            </div>

            {/* RENEWAL AMOUNT */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Giá trị gia hạn (VND) <span className='text-red-400'>*</span>
              </label>
              <input
                type='number'
                min='0'
                step='1000000'
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus: ring-2 focus:ring-blue-500'
                placeholder='1000000000'
                value={renewalAmount || ''}
                onChange={(e) =>
                  setRenewalAmount(parseFloat(e.target.value) || 0)
                }
              />
              <p className='text-xs text-gray-400 mt-1'>
                Giá trị hợp đồng gốc: {formatCurrency(contract.totalAmount)}
              </p>
            </div>

            {/* NEW DATES */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Ngày bắt đầu mới
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-400 cursor-not-allowed'
                  value={formatDate(newStartDate)}
                  disabled
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Ngày kết thúc mới
                </label>
                <input
                  type='text'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-400 cursor-not-allowed'
                  value={formatDate(newEndDate)}
                  disabled
                />
              </div>
            </div>

            {/* NOTES */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Ghi chú
              </label>
              <textarea
                rows={4}
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white placeholder-gray-500 focus:outline-none focus: ring-2 focus:ring-blue-500'
                placeholder='Nhập ghi chú về yêu cầu gia hạn...'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className='bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-6 rounded-xl mb-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-yellow-500'>summarize</span>
            Tóm tắt gia hạn
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div className='p-3 bg-black/20 rounded-lg'>
              <p className='text-gray-400 mb-1'>Thời hạn gia hạn</p>
              <p className='text-2xl font-bold text-blue-400'>
                {renewalYears} năm
              </p>
            </div>

            <div className='p-3 bg-black/20 rounded-lg'>
              <p className='text-gray-400 mb-1'>Giá trị gia hạn</p>
              <p className='text-2xl font-bold text-yellow-400'>
                {formatCurrency(renewalAmount)}
              </p>
            </div>

            <div className='p-3 bg-black/20 rounded-lg'>
              <p className='text-gray-400 mb-1'>Số lần gia hạn</p>
              <p className='text-2xl font-bold text-purple-400'>
                Lần {totalRenewals}
              </p>
            </div>
          </div>

          <div className='mt-4 p-3 bg-black/20 rounded-lg'>
            <p className='text-gray-400 text-xs mb-1'>Thời gian hợp đồng mới</p>
            <p className='font-semibold text-white'>
              {formatDate(newStartDate)} → {formatDate(newEndDate)} (
              {renewalYears} năm)
            </p>
          </div>
        </div>

        {/* WARNINGS */}
        {maxReached && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>
              Hợp đồng đã đạt số lần gia hạn tối đa ({contract.maxRenewals})
            </span>
          </div>
        )}

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
            className='px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={submitting || maxReached}
          >
            {submitting ? (
              <>
                <div className='inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                Đang gửi...
              </>
            ) : (
              <>
                <span className='material-icons'>send</span>
                Gửi yêu cầu gia hạn
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
