import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { useFarmViewModel } from '../../viewmodels/useFarmViewModel';

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border border-gray-300';
    case 'MAINTENANCE':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

export default function FarmPage() {
  const navigate = useNavigate();
  const { data, loading, error, search, setSearch, pageInfo, remove } =
    useFarmViewModel();

  return (
    <div className='flex bg-[#07150D] min-h-screen text-white'>
      <Sidebar />

      <main className='flex-1 p-8'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý nông trại' },
          ]}
        />

        {/* HEADER */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold'>Quản lý Nông trại</h1>
            <p className='text-gray-400'>
              Quản lý các nông trại trồng rừng và cây trong hệ thống.
            </p>
          </div>

          <button
            onClick={() => navigate('/farms/new')}
            className='bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition'
          >
            <span className='material-icons'>add</span>
            Thêm nông trại mới
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* SEARCH */}
        <input
          className='w-full px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] mb-6 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500'
          placeholder='Tìm kiếm theo tên, mã hoặc địa điểm.. .'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <div className='bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden'>
          {/* HEADERS */}
          <div className='grid grid-cols-7 px-6 py-4 text-sm font-semibold text-gray-300 border-b border-[#1E3A2B] bg-[#0A1812]'>
            <span>TÊN & MÃ</span>
            <span>ĐỊA ĐIỂM</span>
            <span>DIỆN TÍCH</span>
            <span>TỔNG CÂY</span>
            <span>LOÀI CÂY</span>
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
                agriculture
              </span>
              <p>Không tìm thấy nông trại nào. </p>
            </div>
          )}

          {/* ROWS */}
          {!loading &&
            data.map((farm) => (
              <div
                key={farm.id}
                className='grid grid-cols-7 items-center px-6 py-4 border-b border-[#1E3A2B] hover:bg-[#13271F] transition'
              >
                {/* Name & Code */}
                <div>
                  <div className='font-semibold'>{farm.name}</div>
                  <div className='text-xs text-gray-400 font-mono'>
                    {farm.code}
                  </div>
                </div>

                {/* Location */}
                <div className='text-sm text-gray-300'>{farm.location}</div>

                {/* Area */}
                <div className='text-sm'>
                  <div className='text-green-400 font-semibold'>
                    {farm.area.toLocaleString()} m²
                  </div>
                  <div className='text-xs text-gray-400'>
                    SD: {farm.usableArea.toLocaleString()} m²
                  </div>
                </div>

                {/* Total Trees */}
                <div className='text-sm'>
                  <div className='font-semibold text-blue-400'>
                    {farm.totalTrees.toLocaleString()}
                  </div>
                  <div className='text-xs text-gray-400'>
                    Sống: {farm.aliveTrees} | Chết: {farm.deadTrees}
                  </div>
                </div>

                {/* Species */}
                <div className='text-sm text-purple-400 font-semibold'>
                  {farm.totalSpecies || 0} loài
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${statusBadgeClass(
                      farm.farmStatus,
                    )}`}
                  >
                    {farm.farmStatus}
                  </span>
                </div>

                {/* Actions */}
                <div className='flex gap-3 justify-center'>
                  <button
                    className='text-gray-400 hover:text-white transition'
                    onClick={() => navigate(`/farms/${farm.id}`)}
                    title='Xem chi tiết'
                  >
                    <span className='material-icons'>visibility</span>
                  </button>

                  <button
                    className='text-green-400 hover:text-green-300 transition'
                    onClick={() => navigate(`/farms/${farm.id}/edit`)}
                    title='Chỉnh sửa'
                  >
                    <span className='material-icons'>edit</span>
                  </button>

                  <button
                    className='text-red-400 hover:text-red-300 transition'
                    onClick={() => remove(farm.id)}
                    title='Xóa'
                  >
                    <span className='material-icons'>delete</span>
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* PAGINATION INFO */}
        {pageInfo && (
          <div className='mt-4 text-sm text-gray-400 text-center'>
            Hiển thị {data.length} / {pageInfo.totalElements} nông trại
          </div>
        )}
      </main>
    </div>
  );
}
