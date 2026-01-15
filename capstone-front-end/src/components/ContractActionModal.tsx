import { useState } from 'react';

interface Props {
  type: 'submit' | 'approve' | 'renew' | 'terminate';
  contractId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContractActionModal({
  type,
  contractId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for different actions
  const [approvalNotes, setApprovalNotes] = useState('');
  const [renewalYears, setRenewalYears] = useState(3);
  const [renewalAmount, setRenewalAmount] = useState(0);
  const [renewalNotes, setRenewalNotes] = useState('');
  const [terminationReason, setTerminationReason] = useState('');

  const getTitle = () => {
    switch (type) {
      case 'submit':
        return 'Gửi phê duyệt';
      case 'approve':
        return 'Phê duyệt hợp đồng';
      case 'renew':
        return 'Yêu cầu gia hạn';
      case 'terminate':
        return 'Chấm dứt hợp đồng';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'submit':
        return 'send';
      case 'approve':
        return 'check_circle';
      case 'renew':
        return 'autorenew';
      case 'terminate':
        return 'cancel';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'submit':
        return 'blue';
      case 'approve':
        return 'green';
      case 'renew':
        return 'yellow';
      case 'terminate':
        return 'red';
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('Không tìm thấy thông tin người dùng');

      const {
        submitContract,
        approveContract,
        requestRenewal,
        terminateContract,
      } = await import('../models/contract.api');

      switch (type) {
        case 'submit':
          await submitContract(contractId);
          break;
        case 'approve':
          await approveContract(contractId, {
            approvedBy: userId,
            notes: approvalNotes || undefined,
          });
          break;
        case 'renew':
          if (!renewalAmount || renewalAmount <= 0) {
            throw new Error('Vui lòng nhập giá trị gia hạn');
          }
          await requestRenewal({
            contractId,
            renewalTermYears: renewalYears,
            renewalAmount,
            notes: renewalNotes || undefined,
            requestedBy: userId,
          });
          break;
        case 'terminate':
          if (!terminationReason.trim()) {
            throw new Error('Vui lòng nhập lý do chấm dứt');
          }
          await terminateContract(contractId, {
            terminationReason,
            terminatedBy: userId,
          });
          break;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl max-w-md w-full p-6'>
        {/* HEADER */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold text-white flex items-center gap-2'>
            <span className={`material-icons text-${getColor()}-500`}>
              {getIcon()}
            </span>
            {getTitle()}
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <span className='material-icons'>close</span>
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className='mb-4 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            {error}
          </div>
        )}

        {/* CONTENT */}
        <div className='space-y-4 mb-6'>
          {type === 'submit' && (
            <p className='text-gray-300'>
              Bạn có chắc muốn gửi hợp đồng này để phê duyệt? Sau khi gửi, bạn
              sẽ không thể chỉnh sửa cho đến khi được duyệt hoặc từ chối.
            </p>
          )}

          {type === 'approve' && (
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Ghi chú phê duyệt (tùy chọn)
              </label>
              <textarea
                rows={3}
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='Nhập ghi chú về quyết định phê duyệt.. .'
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          )}

          {type === 'renew' && (
            <>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Số năm gia hạn <span className='text-red-400'>*</span>
                </label>
                <input
                  type='number'
                  min='1'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-yellow-500'
                  value={renewalYears}
                  onChange={(e) =>
                    setRenewalYears(parseInt(e.target.value) || 1)
                  }
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Giá trị gia hạn (VND) <span className='text-red-400'>*</span>
                </label>
                <input
                  type='number'
                  min='0'
                  step='1000000'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-yellow-500'
                  placeholder='1000000000'
                  value={renewalAmount || ''}
                  onChange={(e) =>
                    setRenewalAmount(parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus:ring-2 focus:ring-yellow-500'
                  placeholder='Ghi chú về gia hạn...'
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                />
              </div>
            </>
          )}

          {type === 'terminate' && (
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Lý do chấm dứt <span className='text-red-400'>*</span>
              </label>
              <textarea
                rows={4}
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-white focus:outline-none focus: ring-2 focus:ring-red-500'
                placeholder='Nhập lý do chấm dứt hợp đồng...'
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                required
              />
              <p className='text-xs text-orange-400 mt-2'>
                ⚠️ Hành động này không thể hoàn tác. Hợp đồng sẽ được đánh dấu
                là đã chấm dứt.
              </p>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition'
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-lg bg-${getColor()}-500 hover:bg-${getColor()}-600 text-${
              type === 'renew' ? 'black' : 'white'
            } font-semibold flex items-center gap-2 transition disabled:opacity-50`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <span className='material-icons text-lg'>{getIcon()}</span>
                {type === 'submit' && 'Gửi'}
                {type === 'approve' && 'Phê duyệt'}
                {type === 'renew' && 'Gia hạn'}
                {type === 'terminate' && 'Chấm dứt'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
