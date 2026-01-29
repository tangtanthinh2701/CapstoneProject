import { useState, useEffect } from 'react';
import {
  getCarbonSummary,
  approvePurchase,
  deliverPurchase,
  cancelPurchase,
  type CarbonSummary,
} from '../models/treePurchase.api';

interface Props {
  phaseId: number;
  onClose: () => void;
  onUpdate: () => void;
}


const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const formatCurrency = (value: number) => {
  if (!value || isNaN(value)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch {
    return '—';
  }
};

export default function PurchaseListModal({
  phaseId,
  onClose,
  onUpdate,
}: Props) {
  const [summary, setSummary] = useState<CarbonSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Loading carbon summary for phase:', phaseId);

      const data = await getCarbonSummary(phaseId);

      console.log('✅ Carbon summary loaded:', data);

      setSummary(data);
    } catch (err: any) {
      console.error('❌ Error loading purchases:', err);
      setError(err.message || 'Không tải được danh sách đơn mua');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phaseId) {
      loadData();
    }
  }, [phaseId]);

  const handleApprove = async (purchaseId: number) => {
    if (!window.confirm('Bạn có chắc muốn duyệt đơn này?')) return;

    try {
      setActionLoading(purchaseId);
      setError(null);

      // Get userId from localStorage
      const userId = localStorage.getItem('userId');

      if (!userId) {
        throw new Error(
          'Không tìm thấy thông tin người dùng.  Vui lòng đăng nhập lại.',
        );
      }

      console.log('🔵 Approving purchase:', purchaseId, 'by user:', userId);

      await approvePurchase(purchaseId, userId);

      console.log('✅ Purchase approved successfully');

      alert('Duyệt đơn thành công!');
      await loadData();
      onUpdate();
    } catch (err: any) {
      console.error('❌ Approve failed:', err);
      setError(err.message || 'Duyệt đơn thất bại');
      alert(err.message || 'Duyệt đơn thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (purchaseId: number) => {
    if (!window.confirm('Xác nhận đã giao hàng? ')) return;

    try {
      setActionLoading(purchaseId);
      setError(null);

      console.log('🔵 Delivering purchase:', purchaseId);

      await deliverPurchase(purchaseId);

      console.log('✅ Purchase delivered successfully');

      alert('Giao hàng thành công!');
      await loadData();
      onUpdate();
    } catch (err: any) {
      console.error('❌ Deliver failed:', err);
      setError(err.message || 'Giao hàng thất bại');
      alert(err.message || 'Giao hàng thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (purchaseId: number) => {
    const reason = window.prompt('Lý do hủy đơn: ');
    if (!reason || !reason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn');
      return;
    }

    try {
      setActionLoading(purchaseId);
      setError(null);

      console.log('🔵 Cancelling purchase:', purchaseId, 'reason:', reason);

      await cancelPurchase(purchaseId, reason);

      console.log('✅ Purchase cancelled successfully');

      alert('Hủy đơn thành công! ');
      await loadData();
      onUpdate();
    } catch (err: any) {
      console.error('❌ Cancel failed:', err);
      setError(err.message || 'Hủy đơn thất bại');
      alert(err.message || 'Hủy đơn thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto'>
      <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl max-w-6xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
            <span className='material-icons text-blue-500'>receipt_long</span>
            Danh sách đơn mua cây
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <span className='material-icons'>close</span>
          </button>
        </div>

        {error && (
          <div className='mb-4 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className='text-center py-12 text-gray-400'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2'></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : !summary ? (
          <div className='text-center py-12 text-gray-400'>
            <span className='material-icons text-5xl mb-2 opacity-30'>
              error
            </span>
            <p>Không tải được dữ liệu</p>
            <button
              onClick={loadData}
              className='mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg'
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* CARBON SUMMARY */}
            <div className='bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-4 mb-6'>
              <h3 className='font-semibold mb-3 text-green-400'>
                📊 Tóm tắt Carbon - {summary.phaseName}
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
                <div>
                  <p className='text-gray-400 text-xs mb-1'>Mục tiêu</p>
                  <p className='font-semibold text-white'>
                    {(summary.targetCarbon || 0).toLocaleString()} tấn
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 text-xs mb-1'>Đã mua</p>
                  <p className='font-semibold text-blue-400'>
                    {(summary.purchasedCarbon || 0).toLocaleString()} tấn
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 text-xs mb-1'>Tiến độ</p>
                  <p className='font-semibold text-green-400'>
                    {(summary.completionPercentage || 0).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 text-xs mb-1'>
                    {(summary.carbonSurplus || 0) > 0 ? 'Thừa' : 'Thiếu'}
                  </p>
                  <p
                    className={`font-semibold ${(summary.carbonSurplus || 0) > 0
                      ? 'text-yellow-400'
                      : 'text-red-400'
                      }`}
                  >
                    {Math.abs(
                      summary.carbonSurplus || summary.carbonDeficit || 0,
                    ).toLocaleString()}{' '}
                    tấn
                  </p>
                </div>
              </div>
            </div>

            {/* PURCHASE LIST */}
            {!summary.purchases || summary.purchases.length === 0 ? (
              <div className='text-center py-12 text-gray-400 bg-[#071811] rounded-lg'>
                <span className='material-icons text-5xl mb-2 opacity-30'>
                  inventory_2
                </span>
                <p>Chưa có đơn mua nào</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {summary.purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className='p-4 bg-[#071811] rounded-lg border border-[#1E3A2B] hover:border-green-500/30 transition'
                  >
                    {/* HEADER */}
                    <div className='flex justify-between items-start mb-3'>
                      <div>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded'>
                            #{purchase.id}
                          </span>
                          <h4 className='font-semibold text-white'>
                            {purchase.treeSpeciesName || 'N/A'}
                          </h4>
                        </div>
                        <p className='text-xs text-gray-400'>
                          Nông trại: {purchase.farmName || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(
                          purchase.purchaseStatus,
                        )}`}
                      >
                        {purchase.purchaseStatus}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm'>
                      <div>
                        <p className='text-gray-400 text-xs mb-1'>Số lượng</p>
                        <p className='font-semibold text-blue-400'>
                          {(purchase.quantity || 0).toLocaleString()} cây
                        </p>
                      </div>
                      <div>
                        <p className='text-gray-400 text-xs mb-1'>Tổng tiền</p>
                        <p className='font-semibold text-yellow-400'>
                          {formatCurrency(purchase.totalPrice)}
                        </p>
                      </div>
                      <div>
                        <p className='text-gray-400 text-xs mb-1'>
                          Carbon ước tính
                        </p>
                        <p className='font-semibold text-green-400'>
                          {(purchase.totalEstimatedCarbon || 0).toFixed(2)} tấn
                        </p>
                      </div>
                      <div>
                        <p className='text-gray-400 text-xs mb-1'>Ngày mua</p>
                        <p className='font-semibold text-white'>
                          {formatDate(purchase.purchaseDate)}
                        </p>
                      </div>
                    </div>

                    {/* NOTES */}
                    {purchase.notes && (
                      <div className='mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-200'>
                        📝 {purchase.notes}
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className='flex flex-wrap gap-2'>
                      {purchase.purchaseStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(purchase.id)} // ← DÙNG Ở ĐÂY
                            disabled={actionLoading === purchase.id}
                            className='px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            {actionLoading === purchase.id ? (
                              <>
                                <div className='inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white'></div>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <span className='material-icons text-sm'>
                                  check
                                </span>
                                Duyệt
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCancel(purchase.id)}
                            disabled={actionLoading === purchase.id}
                            className='px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 disabled: cursor-not-allowed'
                          >
                            <span className='material-icons text-sm'>
                              close
                            </span>
                            Hủy
                          </button>
                        </>
                      )}
                      {purchase.purchaseStatus === 'APPROVED' && (
                        <button
                          onClick={() => handleDeliver(purchase.id)}
                          disabled={actionLoading === purchase.id}
                          className='px-3 py-1.5 bg-green-500 hover:bg-green-600 text-black rounded text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {actionLoading === purchase.id ? (
                            <>
                              <div className='inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-black'></div>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <span className='material-icons text-sm'>
                                local_shipping
                              </span>
                              Giao hàng
                            </>
                          )}
                        </button>
                      )}

                      {purchase.purchaseStatus === 'DELIVERED' && (
                        <div className='flex items-center gap-1 text-xs text-green-400'>
                          <span className='material-icons text-sm'>
                            check_circle
                          </span>
                          Đã giao: {formatDate(purchase.deliveryDate)}
                        </div>
                      )}

                      {purchase.purchaseStatus === 'CANCELLED' && (
                        <div className='flex items-center gap-1 text-xs text-red-400'>
                          <span className='material-icons text-sm'>cancel</span>
                          Đã hủy
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-[#1E3A2B]'>
          <button
            onClick={onClose}
            className='px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
