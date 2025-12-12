import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useTreeSpeciesViewModel } from '../../viewmodels/useTreeSpeciesViewModel';

export default function TreeSpeciesPage() {
  const navigate = useNavigate();
  const { data, loading, search, setSearch, remove } =
    useTreeSpeciesViewModel();

  return (
    <div className='flex bg-[#07150D] min-h-screen text-white'>
      <Sidebar />

      <main className='flex-1 p-8'>
        {/* HEADER */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold'>Quản lý Loại cây</h1>
            <p className='text-gray-400'>
              Thêm, sửa đổi và quản lý tất cả các loại cây trong hệ thống.
            </p>
          </div>

          <button
            onClick={() => navigate('/tree-species/new')}
            className='bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2'
          >
            <span className='material-icons'>add</span>
            Thêm loại cây mới
          </button>
        </div>

        {/* SEARCH */}
        <input
          className='w-full px-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] mb-6'
          placeholder='Tìm kiếm theo tên cây hoặc tên khoa học'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <div className='bg-[#0E2219] rounded-xl border border-[#1E3A2B]'>
          <div className='grid grid-cols-7 px-6 py-4 text-sm text-gray-300 border-b border-[#1E3A2B]'>
            <span>TÊN CÂY</span>
            <span>TÊN KHOA HỌC</span>
            <span>HẤP THỤ CARBON</span>
            <span>TĂNG TRƯỞNG</span>
            <span>GIÁ TRỊ KINH TẾ</span>
            <span>TRẠNG THÁI</span>
            <span>HÀNH ĐỘNG</span>
          </div>

          {loading && (
            <div className='p-6 text-gray-400'>Đang tải dữ liệu...</div>
          )}

          {!loading &&
            data.map((x) => (
              <div
                key={x.id}
                className='grid grid-cols-7 px-6 py-4 border-b border-[#1E3A2B] hover:bg-[#13271F]'
              >
                <span>{x.name}</span>
                <span className='italic text-gray-300'>{x.scientificName}</span>
                <span>{x.carbonAbsorptionRate}</span>
                {/* <div className='flex items-center'>
                  <div className='h-2 w-24 bg-[#1E3A2B] rounded-full'>
                    <div
                      className='h-2 bg-green-500 rounded-full'
                      style={{ width: `${x.carbonAbsorptionRate}%` }}
                    />
                  </div>
                </div> */}

                <span>{x.growthRate}</span>

                <span>{x.hasCommercialValue ? '✔ Có' : '—'}</span>

                <span
                  className={x.isActive ? 'text-green-400' : 'text-gray-500'}
                >
                  {x.isActive ? 'Hoạt động' : 'Ẩn'}
                </span>

                <div className='flex gap-3'>
                  <button
                    onClick={() => navigate(`/tree-species/${x.id}/edit`)}
                  >
                    <span className='material-icons text-green-400'>edit</span>
                  </button>

                  <button onClick={() => remove(x.id)}>
                    <span className='material-icons text-red-400'>delete</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
