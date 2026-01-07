import Sidebar from '../../components/Sidebar';

const statusBadge = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-500/20 text-green-400';
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'SOLD_OUT':
      return 'bg-gray-500/20 text-gray-400';
    case 'EXPIRED':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

export default function CarbonCreditPage() {
  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8 max-w-7xl mx-auto'>
        {/* HEADER */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold'>Quản lý Tín chỉ Carbon</h1>
            <p className='text-gray-400 mt-1'>
              Theo dõi, xác thực và quản lý giao dịch tín chỉ carbon.
            </p>
          </div>

          <button className='bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-xl font-semibold flex gap-2'>
            <span className='material-icons'>add</span>
            Phát hành tín chỉ mới
          </button>
        </div>

        {/* KPI CARDS */}
        <div className='grid grid-cols-4 gap-6 mb-8'>
          <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5'>
            <p className='text-gray-400 text-sm'>Tổng tín chỉ</p>
            <p className='text-2xl font-bold mt-2'>12,450</p>
            <p className='text-green-400 text-xs mt-1'>
              +12% so với tháng trước
            </p>
          </div>

          <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5'>
            <p className='text-gray-400 text-sm'>Giá trị ước tính</p>
            <p className='text-2xl font-bold mt-2'>$450,200</p>
            <p className='text-green-400 text-xs mt-1'>+5% thị trường</p>
          </div>

          <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5'>
            <p className='text-gray-400 text-sm'>Đang chờ duyệt</p>
            <p className='text-2xl font-bold mt-2'>15</p>
            <p className='text-yellow-400 text-xs mt-1'>3 cần bổ sung hồ sơ</p>
          </div>

          <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5'>
            <p className='text-gray-400 text-sm'>AI Score trung bình</p>
            <p className='text-2xl font-bold mt-2'>98.5</p>
            <p className='text-green-400 text-xs mt-1'>Chất lượng rất cao</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-5 mb-6 flex gap-4'>
          <input
            className='flex-1 px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-sm'
            placeholder='Tìm theo mã tín chỉ, tên dự án...'
          />

          <select className='px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]'>
            <option>Tất cả trạng thái</option>
            <option>AVAILABLE</option>
            <option>PENDING</option>
            <option>SOLD_OUT</option>
            <option>EXPIRED</option>
          </select>
        </div>

        {/* TABLE */}
        <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-2xl overflow-hidden'>
          <div className='grid grid-cols-7 px-6 py-4 text-sm text-gray-400 border-b border-[#1E3A2B]'>
            <span>Mã tín chỉ</span>
            <span>Dự án</span>
            <span>Số lượng</span>
            <span>Trạng thái</span>
            <span>Ngày phát hành</span>
            <span>AI Score</span>
            <span>Hành động</span>
          </div>

          {/* ROW */}
          <div className='grid grid-cols-7 px-6 py-4 border-b border-[#1E3A2B] hover:bg-[#13271F]'>
            <span>#CC-2023-8849</span>
            <span>Rừng ngập mặn Cần Giờ</span>
            <span>1,500 tCO₂e</span>

            <span
              className={`inline-flex items-center px-3 py-1 text-xs rounded-full whitespace-nowrap ${statusBadge('AVAILABLE')}`}
              style={{ width: 'fit-content' }}
            >
              Đã phát hành
            </span>

            <span>12/10/2025</span>
            <span className='text-green-400 font-semibold'>98%</span>

            <div className='flex gap-3'>
              <button className='text-gray-300 hover:text-white'>
                <span className='material-icons'>visibility</span>
              </button>
              <button className='text-green-400 hover:text-green-300'>
                <span className='material-icons'>edit</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
