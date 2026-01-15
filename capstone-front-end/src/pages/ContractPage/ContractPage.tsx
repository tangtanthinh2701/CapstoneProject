import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useContractViewModel } from '../../viewmodels/useContractViewModel';

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

const categoryBadgeClass = (category: string) => {
  return category === 'ENTERPRISE_PROJECT'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-purple-100 text-purple-800';
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function ContractPage() {
  const navigate = useNavigate();
  const {
    data,
    stats,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
    remove,
  } = useContractViewModel();

  return (
    <div className='flex bg-[#07150D] min-h-screen text-white'>
      <Sidebar />

      <main className='flex-1 p-8'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý hợp đồng' },
          ]}
        />

        {/* HEADER */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold'>Danh sách Hợp đồng</h1>
            <p className='text-gray-400'>
              Quản lý các hợp đồng dự án trồng rừng trong hệ thống.
            </p>
          </div>

          <button
            onClick={() => navigate('/contracts/new')}
            className='bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition'
          >
            <span className='material-icons'>add</span>
            Tạo hợp đồng mới
          </button>
        </div>

        {/* STATS CARDS */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Tổng số hợp đồng</p>
              <span className='material-icons text-blue-500'>description</span>
            </div>
            <p className='text-3xl font-bold text-blue-400'>{stats.total}</p>
            <p className='text-xs text-gray-400 mt-1'>
              +{stats.total > 0 ? '18%' : '0%'} so với tháng trước
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Đang hoạt động</p>
              <span className='material-icons text-green-500'>
                check_circle
              </span>
            </div>
            <p className='text-3xl font-bold text-green-400'>{stats.active}</p>
            <p className='text-xs text-gray-400 mt-1'>
              Hợp đồng đang có hiệu lực
            </p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Đang chờ duyệt</p>
              <span className='material-icons text-yellow-500'>pending</span>
            </div>
            <p className='text-3xl font-bold text-yellow-400'>
              {stats.pending}
            </p>
            <p className='text-xs text-gray-400 mt-1'>Chờ phê duyệt</p>
          </div>

          <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-gray-400 text-sm'>Chờ gia hạn</p>
              <span className='material-icons text-orange-500'>update</span>
            </div>
            <p className='text-3xl font-bold text-orange-400'>
              {stats.expiringSoon}
            </p>
            <p className='text-xs text-gray-400 mt-1'>Sắp hết hạn</p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* SEARCH & FILTERS */}
        <div className='flex flex-wrap gap-4 mb-6'>
          <div className='flex-1 min-w-[300px]'>
            <div className='relative'>
              <span className='material-icons absolute left-4 top-3.5 text-gray-400'>
                search
              </span>
              <input
                className='w-full pl-12 pr-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-100 placeholder-gray-500 focus:outline-none focus: ring-2 focus:ring-green-500'
                placeholder='Tìm kiếm theo tên, mã hợp đồng, dự án.. .'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className='flex gap-3'>
            <select
              className='px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
              value={monthFilter || ''}
              onChange={(e) =>
                setMonthFilter(e.target.value ? parseInt(e.target.value) : null)
              }
            >
              <option value=''>Tháng/năm</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>

            <select
              className='px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value=''>Tất cả trạng thái</option>
              <option value='DRAFT'>Nháp</option>
              <option value='PENDING'>Chờ duyệt</option>
              <option value='ACTIVE'>Đang hoạt động</option>
              <option value='EXPIRED'>Hết hạn</option>
              <option value='TERMINATED'>Đã chấm dứt</option>
            </select>

            <button
              onClick={() => navigate('/contracts/export')}
              className='px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] hover:bg-[#13271F] rounded-xl text-gray-100 flex items-center gap-2 transition'
            >
              <span className='material-icons'>download</span>
              Xuất Excel
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className='bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden'>
          {/* HEADERS */}
          <div className='grid grid-cols-7 px-6 py-4 text-sm font-semibold text-gray-300 border-b border-[#1E3A2B] bg-[#0A1812]'>
            <span>MÃ HỢP ĐỒNG</span>
            <span>DỰ ÁN / LOẠI</span>
            <span>NGÀY BẮT ĐẦU</span>
            <span>THỜI HẠN</span>
            <span>GIÁ TRỊ HỢP ĐỒNG</span>
            <span>TRẠNG THÁI</span>
            <span className='text-center'>HÀNH ĐỘNG</span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className='px-6 py-12 text-center text-gray-400'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2'></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && data.length === 0 && (
            <div className='px-6 py-12 text-center text-gray-400'>
              <span className='material-icons text-5xl mb-2 opacity-50'>
                inbox
              </span>
              <p>Không tìm thấy hợp đồng nào. </p>
            </div>
          )}

          {/* ROWS */}
          {!loading &&
            data.map((contract) => (
              <div
                key={contract.id}
                className='grid grid-cols-7 items-center px-6 py-4 border-b border-[#1E3A2B] hover:bg-[#13271F] transition cursor-pointer'
                onClick={() => navigate(`/contracts/${contract.id}`)}
              >
                {/* Code */}
                <div>
                  <div className='font-semibold font-mono'>
                    {contract.contractCode}
                  </div>
                  <div className='text-xs text-gray-400'>ID: {contract.id}</div>
                </div>

                {/* Project & Type */}
                <div>
                  <div className='font-semibold text-gray-100'>
                    {contract.projectName}
                  </div>
                  <div className='flex gap-1 mt-1'>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${categoryBadgeClass(
                        contract.contractCategory,
                      )}`}
                    >
                      {contract.contractCategory === 'ENTERPRISE_PROJECT'
                        ? 'Dự án'
                        : 'Cá nhân'}
                    </span>
                    <span className='px-2 py-0.5 text-xs bg-gray-700 text-gray-200 rounded'>
                      {contract.contractType === 'OWNERSHIP'
                        ? 'Sở hữu'
                        : 'Dịch vụ'}
                    </span>
                  </div>
                </div>

                {/* Start Date */}
                <div className='text-sm text-gray-300'>
                  {formatDate(contract.startDate)}
                </div>

                {/* Term */}
                <div className='text-sm'>
                  <div className='text-gray-100'>
                    {contract.contractTermYears} năm
                  </div>
                  <div className='text-xs text-gray-400'>
                    {contract.daysUntilExpiry !== null
                      ? `Còn ${contract.daysUntilExpiry} ngày`
                      : '—'}
                  </div>
                </div>

                {/* Total Amount */}
                <div className='text-sm font-semibold text-yellow-400'>
                  {formatCurrency(contract.totalAmount)}
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${statusBadgeClass(
                      contract.contractStatus,
                    )}`}
                  >
                    {contract.contractStatus}
                  </span>
                  {contract.isExpiringSoon && (
                    <div className='text-xs text-orange-400 mt-1'>
                      ⚠️ Sắp hết hạn
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div
                  className='flex gap-3 justify-center'
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className='text-gray-400 hover:text-white transition'
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                    title='Xem chi tiết'
                  >
                    <span className='material-icons'>visibility</span>
                  </button>

                  {contract.contractStatus === 'DRAFT' && (
                    <button
                      className='text-green-400 hover:text-green-300 transition'
                      onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                      title='Chỉnh sửa'
                    >
                      <span className='material-icons'>edit</span>
                    </button>
                  )}

                  <button
                    className='text-red-400 hover:text-red-300 transition'
                    onClick={() => remove(contract.id)}
                    title='Xóa'
                  >
                    <span className='material-icons'>delete</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* PAGINATION INFO */}
        <div className='mt-4 text-sm text-gray-400 text-center'>
          Hiển thị {data.length} hợp đồng
        </div>
      </main>
    </div>
  );
}
