import Sidebar from '../../components/Sidebar';

const transactions = [
  {
    code: '#TRX-9982',
    date: '20/11/2025',
    company: 'PetroVietnam Gas',
    subCompany: 'Air Liquide Vietnam',
    product: 'Tín chỉ Carbon',
    quantity: '500 Tín chỉ',
    value: '12,500,000',
    insight: { label: 'Tốt', type: 'success' },
    status: { label: 'Hoàn tất', type: 'success' },
  },
  {
    code: '#TRX-9981',
    date: '20/11/2025',
    company: 'VinFast Mfg',
    subCompany: 'Carbon Trust Fund',
    product: 'Tín chỉ Carbon',
    quantity: '200 Tín chỉ',
    value: '450,000,000',
    insight: { label: 'Lưu ý', type: 'warning' },
    status: { label: 'Chờ xử lý', type: 'pending' },
  },
  {
    code: '#TRX-9979',
    date: '19/10/2025',
    company: 'TechMed Solutions',
    subCompany: 'Japan Vietnam Gas',
    product: 'Tín chỉ Carbon',
    quantity: '300 Tín chỉ',
    value: '45,000,000',
    insight: { label: 'Cao', type: 'danger' },
    status: { label: 'Đã hủy', type: 'danger' },
  },
];

const badge = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/15 text-green-400';
    case 'warning':
      return 'bg-yellow-500/15 text-yellow-400';
    case 'pending':
      return 'bg-orange-500/15 text-orange-400';
    case 'danger':
      return 'bg-red-500/15 text-red-400';
    default:
      return 'bg-gray-500/15 text-gray-300';
  }
};

export default function TransactionPage() {
  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-8'>
        {/* HEADER */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold'>Quản lý Giao dịch</h1>
            <p className='text-gray-400 mt-1'>
              Theo dõi dòng chảy Oxy công nghiệp và Tín chỉ Carbon toàn hệ
              thống.
            </p>
          </div>

          <div className='flex gap-3'>
            <button className='px-4 py-2 rounded-lg bg-[#143024] text-gray-200'>
              Xuất báo cáo
            </button>
            <button className='px-4 py-2 rounded-lg bg-green-500 text-black font-semibold'>
              + Tạo giao dịch
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className='grid grid-cols-4 gap-4 mb-6'>
          {[
            {
              label: 'Tổng Oxy đã giao dịch',
              value: '45,200 m³',
              trend: '+12%',
            },
            { label: 'Tín chỉ Carbon', value: '1,200 tấn', trend: '-5%' },
            { label: 'Giao dịch đang chờ', value: '12', trend: '+2%' },
            { label: 'Tổng giá trị (VND)', value: '15.5 Tỷ', trend: '+8%' },
          ].map((s, i) => (
            <div
              key={i}
              className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl p-4'
            >
              <div className='text-sm text-gray-400'>{s.label}</div>
              <div className='text-2xl font-semibold mt-1'>{s.value}</div>
              <div className='text-xs text-green-400 mt-1'>{s.trend}</div>
            </div>
          ))}
        </div>

        {/* FILTER */}
        <div className='flex gap-3 mb-4'>
          <input
            className='flex-1 px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-sm'
            placeholder='Tìm theo mã GD, tên công ty...'
          />
          <select className='px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-sm'>
            <option>Tháng này</option>
          </select>
          <select className='px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-sm'>
            <option>Tất cả sản phẩm</option>
          </select>
          <select className='px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-sm'>
            <option>Tất cả trạng thái</option>
          </select>
        </div>

        {/* TABLE */}
        <div className='bg-[#0E2219] border border-[#1E3A2B] rounded-xl overflow-hidden'>
          <div className='grid grid-cols-7 px-6 py-4 text-xs text-gray-400 border-b border-[#1E3A2B]'>
            <span>MÃ GD</span>
            <span>BÊN MUA / BÊN BÁN</span>
            <span>SẢN PHẨM</span>
            <span>SỐ LƯỢNG</span>
            <span>GIÁ TRỊ (VND)</span>
            <span>AI INSIGHT</span>
            <span>TRẠNG THÁI</span>
          </div>

          {transactions.map((t, i) => (
            <div
              key={i}
              className='grid grid-cols-7 px-6 py-4 border-b border-[#1E3A2B] hover:bg-[#13271F]'
            >
              <div>
                <div className='font-medium'>{t.code}</div>
                <div className='text-xs text-gray-400'>{t.date}</div>
              </div>

              <div>
                <div>{t.company}</div>
                <div className='text-xs text-gray-400'>{t.subCompany}</div>
              </div>

              <div>{t.product}</div>
              <div>{t.quantity}</div>
              <div className='font-semibold'>{t.value}</div>

              <div>
                <span className={`badge ${badge(t.insight.type)}`}>
                  {t.insight.label}
                </span>
              </div>

              <div>
                <span className={`badge ${badge(t.status.type)}`}>
                  {t.status.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className='flex justify-between items-center mt-4 text-sm text-gray-400'>
          <span>Hiển thị 1-5 trong số 48 giao dịch</span>
          <div className='flex gap-2'>
            <button className='px-3 py-1 bg-[#0E2219] border border-[#1E3A2B] rounded-lg'>
              Trước
            </button>
            <button className='px-3 py-1 bg-green-500 text-black rounded-lg'>
              1
            </button>
            <button className='px-3 py-1 bg-[#0E2219] border border-[#1E3A2B] rounded-lg'>
              Tiếp
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
