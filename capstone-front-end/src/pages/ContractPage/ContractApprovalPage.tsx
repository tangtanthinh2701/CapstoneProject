import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  getContractById,
  approveContract,
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

export default function ContractApprovalPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [approvalNotes, setApprovalNotes] = useState('');
  const [checklist, setChecklist] = useState({
    projectVerified: false,
    amountVerified: false,
    dateVerified: false,
    termsVerified: false,
    documentVerified: false,
  });

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

      if (response.data.contractStatus !== 'PENDING') {
        throw new Error('Hợp đồng không ở trạng thái chờ phê duyệt');
      }

      setContract(response.data);
    } catch (err: any) {
      console.error('Error loading contract:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(checklist).every((v) => v === true);

  const handleApprove = async () => {
    if (!contract) return;

    if (!allChecksPassed) {
      alert('Vui lòng hoàn thành tất cả các mục kiểm tra! ');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt hợp đồng này?'))
      return;

    try {
      setSubmitting(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      await approveContract(contract.id, {
        approvedBy: userId,
        notes: approvalNotes || undefined,
      });

      alert('Phê duyệt hợp đồng thành công!');
      navigate('/contracts/workflow');
    } catch (err: any) {
      console.error('Approval failed:', err);
      setError(err.message || 'Phê duyệt thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = () => {
    const reason = window.prompt('Lý do từ chối:');
    if (!reason || !reason.trim()) return;

    alert('Chức năng từ chối đang được phát triển.  Lý do:  ' + reason);
    // TODO: Implement reject API
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
            { label: 'Quy trình xử lý', href: '/contracts/workflow' },
            { label: 'Phê duyệt hợp đồng' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <span className='material-icons text-yellow-500 text-4xl'>
            verified_user
          </span>
          Phê duyệt Hợp đồng
        </h1>
        <p className='text-gray-400 mb-8'>
          Xem xét và phê duyệt hợp đồng{' '}
          <span className='text-yellow-400 font-mono'>
            {contract.contractCode}
          </span>
        </p>

        {/* CONTRACT SUMMARY */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-blue-500'>description</span>
            Thông tin hợp đồng
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
              <p className='text-gray-400 text-sm mb-1'>Loại hợp đồng</p>
              <p className='font-semibold text-lg'>
                {contract.contractType === 'OWNERSHIP' ? 'Sở hữu' : 'Dịch vụ'}
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                {contract.contractCategory === 'ENTERPRISE_PROJECT'
                  ? 'Dự án doanh nghiệp'
                  : 'Cây cá nhân'}
              </p>
            </div>

            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Tổng giá trị</p>
              <p className='font-semibold text-2xl text-yellow-400'>
                {formatCurrency(contract.totalAmount)}
              </p>
            </div>

            <div className='p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-1'>Thời hạn</p>
              <p className='font-semibold text-lg'>
                {contract.contractTermYears} năm
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                {formatDate(contract.startDate)} -{' '}
                {formatDate(contract.endDate)}
              </p>
            </div>
          </div>

          {contract.content && (
            <div className='mt-4 p-4 bg-[#071811] rounded-lg'>
              <p className='text-gray-400 text-sm mb-2'>Nội dung hợp đồng</p>
              <div className='grid grid-cols-3 gap-4 text-sm'>
                {contract.content.treeCount && (
                  <div>
                    <p className='text-gray-400'>Số lượng cây: </p>
                    <p className='font-semibold text-green-400'>
                      {contract.content.treeCount.toLocaleString()}
                    </p>
                  </div>
                )}
                {contract.content.carbonPercentage && (
                  <div>
                    <p className='text-gray-400'>% Carbon:</p>
                    <p className='font-semibold text-blue-400'>
                      {contract.content.carbonPercentage}%
                    </p>
                  </div>
                )}
              </div>
              {contract.content.benefits &&
                contract.content.benefits.length > 0 && (
                  <div className='mt-3'>
                    <p className='text-gray-400 text-xs mb-1'>Quyền lợi:</p>
                    <ul className='list-disc list-inside text-sm text-gray-200'>
                      {contract.content.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* CHECKLIST */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-green-500'>checklist</span>
            Danh sách kiểm tra
          </h2>

          <div className='space-y-3'>
            <label className='flex items-center gap-3 p-4 bg-[#071811] rounded-lg cursor-pointer hover:bg-[#0A1A12] transition'>
              <input
                type='checkbox'
                className='w-5 h-5 rounded text-green-500 focus:ring-green-500'
                checked={checklist.projectVerified}
                onChange={() => handleChecklistChange('projectVerified')}
              />
              <div className='flex-1'>
                <p className='font-semibold'>Xác minh dự án</p>
                <p className='text-sm text-gray-400'>
                  Dự án tồn tại và đang hoạt động
                </p>
              </div>
            </label>

            <label className='flex items-center gap-3 p-4 bg-[#071811] rounded-lg cursor-pointer hover:bg-[#0A1A12] transition'>
              <input
                type='checkbox'
                className='w-5 h-5 rounded text-green-500 focus:ring-green-500'
                checked={checklist.amountVerified}
                onChange={() => handleChecklistChange('amountVerified')}
              />
              <div className='flex-1'>
                <p className='font-semibold'>Xác minh giá trị</p>
                <p className='text-sm text-gray-400'>
                  Giá trị hợp đồng phù hợp với quy định
                </p>
              </div>
            </label>

            <label className='flex items-center gap-3 p-4 bg-[#071811] rounded-lg cursor-pointer hover:bg-[#0A1A12] transition'>
              <input
                type='checkbox'
                className='w-5 h-5 rounded text-green-500 focus:ring-green-500'
                checked={checklist.dateVerified}
                onChange={() => handleChecklistChange('dateVerified')}
              />
              <div className='flex-1'>
                <p className='font-semibold'>Xác minh thời hạn</p>
                <p className='text-sm text-gray-400'>
                  Ngày bắt đầu và kết thúc hợp lệ
                </p>
              </div>
            </label>

            <label className='flex items-center gap-3 p-4 bg-[#071811] rounded-lg cursor-pointer hover: bg-[#0A1A12] transition'>
              <input
                type='checkbox'
                className='w-5 h-5 rounded text-green-500 focus:ring-green-500'
                checked={checklist.termsVerified}
                onChange={() => handleChecklistChange('termsVerified')}
              />
              <div className='flex-1'>
                <p className='font-semibold'>Xác minh điều khoản</p>
                <p className='text-sm text-gray-400'>
                  Các điều khoản hợp đồng đầy đủ và rõ ràng
                </p>
              </div>
            </label>

            <label className='flex items-center gap-3 p-4 bg-[#071811] rounded-lg cursor-pointer hover:bg-[#0A1A12] transition'>
              <input
                type='checkbox'
                className='w-5 h-5 rounded text-green-500 focus:ring-green-500'
                checked={checklist.documentVerified}
                onChange={() => handleChecklistChange('documentVerified')}
              />
              <div className='flex-1'>
                <p className='font-semibold'>Xác minh tài liệu</p>
                <p className='text-sm text-gray-400'>
                  Tất cả tài liệu cần thiết đã được đính kèm
                </p>
              </div>
            </label>
          </div>

          {!allChecksPassed && (
            <div className='mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-300 flex items-center gap-2'>
              <span className='material-icons text-sm'>info</span>
              Vui lòng hoàn thành tất cả các mục kiểm tra trước khi phê duyệt
            </div>
          )}
        </div>

        {/* APPROVAL NOTES */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] mb-6'>
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-purple-500'>note_add</span>
            Ghi chú phê duyệt
          </h2>

          <textarea
            rows={4}
            className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white placeholder-gray-500 focus:outline-none focus: ring-2 focus:ring-green-500'
            placeholder='Nhập ghi chú về quyết định phê duyệt (tùy chọn)...'
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
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
            onClick={() => navigate('/contracts/workflow')}
            className='px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition'
            disabled={submitting}
          >
            Hủy
          </button>

          <button
            onClick={handleReject}
            className='px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 transition'
            disabled={submitting}
          >
            <span className='material-icons'>cancel</span>
            Từ chối
          </button>

          <button
            onClick={handleApprove}
            className='px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!allChecksPassed || submitting}
          >
            {submitting ? (
              <>
                <div className='inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-black'></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <span className='material-icons'>check_circle</span>
                Phê duyệt hợp đồng
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
