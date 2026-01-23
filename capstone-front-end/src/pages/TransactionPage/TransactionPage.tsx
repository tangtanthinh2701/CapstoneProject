import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { paymentApi, type PaymentTransaction } from '../../models/payment.api';

const statusBadge = (status: string) => {
  switch (status) {
    case 'SUCCESS':
    case '00': // VNPay success code
      return 'bg-green-500/20 text-green-400';
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'FAILED':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

export default function TransactionPage() {
  const { isAdmin, user } = useAuth();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Modal
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState(100000);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (isAdmin) {
        response = await paymentApi.getAll({ page: 0, size: 100 });
      } else {
        response = await paymentApi.getMyHistory({ page: 0, size: 100 });
      }

      const data = (response as any)?.data || response || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Không tải được lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleCreatePayment = async () => {
    try {
      if (amount < 10000) {
        alert('Số tiền tối thiểu là 10.000 VNĐ');
        return;
      }

      // Call API to get payment URL
      const response = await paymentApi.createVnpay({
        amount,
        orderInfo: `Nap tien vao tai khoan ${user?.username}`
      });

      const paymentUrl = (response as any)?.data || response;
      if (paymentUrl && typeof paymentUrl === 'string') {
        // Redirect to VNPay
        window.location.href = paymentUrl;
      } else {
        alert('Không lấy được đường dẫn thanh toán');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo thanh toán');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="flex bg-[#07150D] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Giao dịch & Thanh toán' },
          ]}
        />

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Giao dịch</h1>
            <p className="text-gray-400">
              {isAdmin ? 'Quản lý toàn bộ giao dịch trong hệ thống' : 'Xem lịch sử và thực hiện thanh toán'}
            </p>
          </div>

          {!isAdmin && (
            <button
              onClick={() => setShowPayment(true)}
              className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              <span className="material-icons">qr_code_2</span>
              Nạp tiền / Thanh toán
            </button>
          )}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl">
            <p>{error}</p>
            <button onClick={loadData} className="mt-2 text-sm underline">Thử lại</button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="material-icons text-6xl mb-4 opacity-30">receipt_long</span>
            <p>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E3A2B]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Mã GD</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Số tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Phương thức</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ngày GD</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[#1E3A2B] hover:bg-[#13271F] transition">
                    <td className="px-6 py-4 font-mono text-green-400">{t.paymentCode}</td>
                    <td className="px-6 py-4 font-bold">{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4 text-gray-300">{t.paymentMethod}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(t.paymentDate).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(t.paymentStatus)}`}>
                        {t.paymentStatus === '00' ? 'SUCCESS' : t.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAYMENT MODAL */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-3xl text-blue-500">account_balance_wallet</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Nạp tiền vào tài khoản</h2>
              <p className="text-gray-400 text-sm mb-6">Nhập số tiền bạn muốn nạp qua VNPay</p>

              <div className="mb-6">
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-center text-xl font-bold text-green-400 focus:ring-2 focus:ring-green-500 outline-none"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  min={10000}
                  step={10000}
                />
                <p className="text-xs text-gray-500 mt-2">Tối thiểu 10.000đ</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCreatePayment}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition"
                >
                  Tiếp tục thanh toán
                </button>
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full py-3 text-gray-400 hover:text-white"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
