import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { contractApi, type Contract } from '../../models/contract.api';

const statusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'EXPIRED':
      return 'bg-red-100 text-red-800';
    case 'TERMINATED':
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

export default function ContractDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await contractApi.getById(id);
        const data = (response as any)?.data || response;
        setContract(data);
      } catch (err: any) {
        setError(err.message || 'Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleApprove = async () => {
    if (!contract) return;
    if (!window.confirm('Bạn có chắc muốn phê duyệt hợp đồng này?')) return;

    try {
      setActionLoading(true);
      await contractApi.approve(contract.id);
      alert('Phê duyệt thành công!');
      navigate('/contracts');
    } catch (err: any) {
      alert(err.message || 'Phê duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!contract) return;
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await contractApi.reject(contract.id, reason);
      alert('Đã từ chối hợp đồng');
      navigate('/contracts');
    } catch (err: any) {
      alert(err.message || 'Từ chối thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return (
      <div className="flex bg-[#07150D] text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-400">Đang tải...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex bg-[#07150D] text-white min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl">
            <p>{error || 'Không tìm thấy hợp đồng'}</p>
            <button onClick={() => navigate('/contracts')} className="mt-2 text-sm underline">
              Quay lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#07150D] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Hợp đồng', href: '/contracts' },
            { label: contract.contractCode },
          ]}
        />

        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-400 font-mono mb-1">{contract.contractCode}</p>
            <h1 className="text-3xl font-bold mb-2">Chi tiết Hợp đồng</h1>
            <span className={`px-3 py-1 text-sm rounded-full ${statusBadge(contract.contractStatus)}`}>
              {contract.contractStatus}
            </span>
          </div>

          {isAdmin && contract.contractStatus === 'PENDING' && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                <span className="material-icons text-sm">check</span>
                Phê duyệt
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                <span className="material-icons text-sm">close</span>
                Từ chối
              </button>
            </div>
          )}

          {!isAdmin && contract.contractStatus === 'PENDING' && (
            <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm flex items-center gap-2">
              <span className="material-icons text-sm">hourglass_empty</span>
              Đang chờ Admin phê duyệt
            </div>
          )}
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-green-500">description</span>
              Thông tin cơ bản
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Loại hợp đồng:</span>
                <span className="font-semibold">{contract.contractType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Giá trị:</span>
                <span className="font-semibold text-green-400">{formatCurrency(contract.totalValue)}</span>
              </div>
              {contract.carbonCreditPercentage && (
                <div className="flex justify-between">
                  <span className="text-gray-400">% Tín chỉ carbon:</span>
                  <span className="font-semibold">{contract.carbonCreditPercentage}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-blue-500">calendar_today</span>
              Thời gian
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Ngày bắt đầu:</span>
                <span className="font-semibold">{new Date(contract.startDate).toLocaleDateString('vi-VN')}</span>
              </div>
              {contract.endDate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày kết thúc:</span>
                  <span className="font-semibold">{new Date(contract.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {contract.durationYears && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Thời hạn:</span>
                  <span className="font-semibold">{contract.durationYears} năm</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-purple-500">settings</span>
              Tùy chọn
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Có thể gia hạn:</span>
                <span className="font-semibold">{contract.isRenewable ? 'Có' : 'Không'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mã dự án:</span>
                <span className="font-semibold">#{contract.projectId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/contracts')}
            className="px-6 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-lg text-gray-300 hover:bg-[#13271F] transition flex items-center gap-2"
          >
            <span className="material-icons">arrow_back</span>
            Quay lại danh sách
          </button>
        </div>
      </main>
    </div>
  );
}
