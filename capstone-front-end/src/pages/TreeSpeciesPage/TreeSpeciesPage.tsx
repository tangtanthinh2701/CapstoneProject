import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { useTreeSpeciesViewModel } from '../../viewmodels/useTreeSpeciesViewModel';

export default function TreeSpeciesPage() {
  const navigate = useNavigate();
  const { data, loading, error, search, setSearch, pageInfo, remove } =
    useTreeSpeciesViewModel();

  return (
    <div className='flex bg-[#07150D] min-h-screen text-white'>
      <Sidebar />

      <main className='flex-1 p-8'>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý loài cây' },
          ]}
        />

        {/* HEADER */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold'>Quản lý Loài cây</h1>
            <p className='text-gray-400'>
              Thêm, sửa đổi và quản lý tất cả các loài cây trong hệ thống.
            </p>
          </div>

          <button
            onClick={() => navigate('/tree-species/new')}
            className='bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition'
          >
            <span className='material-icons'>add</span>
            Thêm loài cây mới
          </button>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* SEARCH */}
        <input
          className='w-full px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] mb-6 text-gray-100 placeholder-gray-500 focus:outline-none focus: ring-2 focus:ring-green-500'
          placeholder='Tìm kiếm theo tên cây hoặc tên khoa học.. .'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <div className='bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden'>
          {/* HEADERS */}
          <div className='grid grid-cols-6 px-6 py-4 text-sm font-semibold text-gray-300 border-b border-[#1E3A2B] bg-[#0A1812]'>
            <span>TÊN CÂY</span>
            <span>TÊN KHOA HỌC</span>
            <span>HẤP THỤ CO₂/NĂM</span>
            <span>DỰ ĐOÁN 5 NĂM</span>
            <span>DỰ ĐOÁN 10 NĂM</span>
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
                nature
              </span>
              <p>Không tìm thấy loài cây nào. </p>
            </div>
          )}

          {/* ROWS */}
          {!loading &&
            data.map((x) => (
              <div
                key={x.id}
                className='grid grid-cols-6 items-center px-6 py-4 border-b border-[#1E3A2B] hover:bg-[#13271F] transition'
              >
                {/* Name */}
                <div>
                  <div className='font-semibold'>{x.name}</div>
                  {x.imageUrl && (
                    <img
                      src={x.imageUrl}
                      alt={x.name}
                      className='w-12 h-12 rounded mt-1 object-cover'
                    />
                  )}
                </div>

                {/* Scientific Name */}
                <span className='italic text-gray-300'>{x.scientificName}</span>

                {/* Carbon Per Year */}
                <span className='text-green-400 font-semibold'>
                  {x.estimatedCarbonPerYear.toFixed(1)} tấn
                </span>

                {/* 5 Years */}
                <span className='text-blue-400'>
                  {x.estimatedCarbon5Years.toFixed(1)} tấn
                </span>

                {/* 10 Years */}
                <span className='text-purple-400'>
                  {x.estimatedCarbon10Years.toFixed(1)} tấn
                </span>

                {/* Actions */}
                <div className='flex gap-3 justify-center'>
                  <button
                    className='text-gray-400 hover:text-white transition'
                    onClick={() => navigate(`/tree-species/${x.id}`)}
                    title='Xem chi tiết'
                  >
                    <span className='material-icons'>visibility</span>
                  </button>

                  <button
                    className='text-green-400 hover:text-green-300 transition'
                    onClick={() => navigate(`/tree-species/${x.id}/edit`)}
                    title='Chỉnh sửa'
                  >
                    <span className='material-icons'>edit</span>
                  </button>

                  <button
                    className='text-red-400 hover:text-red-300 transition'
                    onClick={() => remove(x.id)}
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
            Hiển thị {data.length} / {pageInfo.totalElements} loài cây
          </div>
        )}
      </main>
    </div>
  );
}
