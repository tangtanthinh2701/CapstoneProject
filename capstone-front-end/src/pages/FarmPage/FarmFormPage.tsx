import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useFarmFormViewModel } from '../../viewmodels/useFarmViewModel';

const statusOptions = [
  { value: 'ACTIVE', label: 'Hoạt động', color: 'green' },
  { value: 'INACTIVE', label: 'Ngưng hoạt động', color: 'gray' },
  { value: 'MAINTENANCE', label: 'Bảo trì', color: 'yellow' },
];

export default function FarmFormPage() {
  const navigate = useNavigate();
  const { isEdit, loading, initialLoading, error, form, updateField, save } =
    useFarmFormViewModel();

  if (initialLoading) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4'></div>
          <p className='text-gray-400'>Đang tải dữ liệu... </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      await save();
      navigate('/farms');
    } catch (err) {
      // Error handled in viewmodel
    }
  };

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-10 max-w-5xl mx-auto'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý nông trại', href: '/farms' },
            { label: isEdit ? 'Cập nhật nông trại' : 'Tạo nông trại mới' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-2'>
          {isEdit ? 'Cập nhật Nông trại' : 'Tạo Nông trại Mới'}
        </h1>
        <p className='text-gray-400 mb-8'>
          Điền đầy đủ thông tin để {isEdit ? 'cập nhật' : 'tạo'} nông trại trồng
          rừng.
        </p>

        {/* ERROR */}
        {error && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* BASIC INFO */}
        <section className='mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-green-500'>info</span>
            Thông tin cơ bản
          </h2>

          <div className='space-y-4'>
            {/* NAME */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Tên nông trại <span className='text-red-400'>*</span>
              </label>
              <input
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='Ví dụ: Nông trại Rừng Xanh Cà Mau'
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>Mô tả</label>
              <textarea
                rows={3}
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus: outline-none focus:ring-2 focus:ring-green-500'
                placeholder='Mô tả về nông trại.. .'
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {/* STATUS & PLANTING DATE */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Trạng thái
                </label>
                <select
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus: outline-none focus:ring-2 focus:ring-green-500'
                  value={form.farmStatus}
                  onChange={(e) => updateField('farmStatus', e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Ngày bắt đầu trồng
                </label>
                <input
                  type='date'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus: outline-none focus:ring-2 focus:ring-green-500'
                  value={form.plantingDate}
                  onChange={(e) => updateField('plantingDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section className='mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-blue-500'>location_on</span>
            Vị trí & Địa điểm
          </h2>

          <div className='space-y-4'>
            {/* LOCATION TEXT */}
            <div>
              <label className='block text-sm mb-2 text-gray-300'>
                Địa chỉ chi tiết <span className='text-red-400'>*</span>
              </label>
              <input
                className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='Xã Đất Mũi, Huyện Ngọc Hiển, Tỉnh Cà Mau'
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>

            {/* COORDINATES */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Vĩ độ (Latitude)
                </label>
                <input
                  type='number'
                  step='0.0001'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='8.5833'
                  value={form.latitude}
                  onChange={(e) =>
                    updateField('latitude', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Kinh độ (Longitude)
                </label>
                <input
                  type='number'
                  step='0.0001'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='104.7333'
                  value={form.longitude}
                  onChange={(e) =>
                    updateField('longitude', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* AREA & ENVIRONMENT */}
        <section className='mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]'>
          <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <span className='material-icons text-yellow-500'>terrain</span>
            Diện tích & Môi trường
          </h2>

          <div className='space-y-4'>
            {/* AREA */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Tổng diện tích (m²) <span className='text-red-400'>*</span>
                </label>
                <input
                  type='number'
                  step='0.01'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='500000'
                  value={form.area}
                  onChange={(e) =>
                    updateField('area', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Diện tích sử dụng (m²)
                </label>
                <input
                  type='number'
                  step='0.01'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='450000'
                  value={form.usableArea}
                  onChange={(e) =>
                    updateField('usableArea', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {/* SOIL & CLIMATE */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Loại đất
                </label>
                <input
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='Đất phù sa ngập mặn'
                  value={form.soilType}
                  onChange={(e) => updateField('soilType', e.target.value)}
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Vùng khí hậu
                </label>
                <input
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus: ring-green-500'
                  placeholder='Nhiệt đới gió mùa'
                  value={form.climateZone}
                  onChange={(e) => updateField('climateZone', e.target.value)}
                />
              </div>
            </div>

            {/* WEATHER */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Lượng mưa TB (mm/năm)
                </label>
                <input
                  type='number'
                  step='0.1'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus: ring-2 focus:ring-green-500'
                  placeholder='2400'
                  value={form.avgRainfall}
                  onChange={(e) =>
                    updateField('avgRainfall', parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-300'>
                  Nhiệt độ TB (°C)
                </label>
                <input
                  type='number'
                  step='0.1'
                  className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus: ring-green-500'
                  placeholder='27. 5'
                  value={form.avgTemperature}
                  onChange={(e) =>
                    updateField(
                      'avgTemperature',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* BUTTONS */}
        <div className='flex justify-end gap-3 pt-6 border-t border-[#1E3A2B]'>
          <button
            className='px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition'
            onClick={() => navigate('/farms')}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            className='px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold flex items-center gap-2 transition disabled:opacity-50'
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black'></div>
                Đang lưu...
              </>
            ) : (
              <>
                <span className='material-icons'>save</span>
                {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
