import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useTreeSpeciesFormViewModel } from '../../viewmodels/useTreeSpeciesViewModel';

export default function TreeSpeciesFormPage() {
  const navigate = useNavigate();
  const { isEdit, loading, initialLoading, error, form, updateField, save } =
    useTreeSpeciesFormViewModel();

  if (initialLoading) {
    return (
      <div className='flex bg-[#07150D] text-white min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4'></div>
          <p className='text-gray-400'>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      await save();
      navigate('/tree-species');
    } catch (err) {
      // Error handled in viewmodel
    }
  };

  return (
    <div className='flex bg-[#07150D] text-white min-h-screen'>
      <Sidebar />

      <main className='flex-1 p-10 max-w-3xl mx-auto'>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý loài cây', href: '/tree-species' },
            { label: isEdit ? 'Cập nhật loài cây' : 'Tạo loài cây mới' },
          ]}
        />

        <h1 className='text-3xl font-bold mb-2'>
          {isEdit ? 'Cập nhật Loài cây' : 'Thêm Loài cây Mới'}
        </h1>
        <p className='text-gray-400 mb-8'>
          Điền đầy đủ thông tin để {isEdit ? 'cập nhật' : 'tạo'} loài cây.
        </p>

        {/* ERROR */}
        {error && (
          <div className='mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2'>
            <span className='material-icons'>error</span>
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <div className='bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] space-y-4'>
          {/* NAME */}
          <div>
            <label className='block text-sm mb-2 text-gray-300'>
              Tên cây <span className='text-red-400'>*</span>
            </label>
            <input
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
              placeholder='Ví dụ: Cây Phi Lao'
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          {/* SCIENTIFIC NAME */}
          <div>
            <label className='block text-sm mb-2 text-gray-300'>
              Tên khoa học <span className='text-red-400'>*</span>
            </label>
            <input
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus: ring-2 focus:ring-green-500'
              placeholder='Ví dụ:  Casuarina equisetifolia'
              value={form.scientificName}
              onChange={(e) => updateField('scientificName', e.target.value)}
            />
          </div>

          {/* CARBON ABSORPTION RATE */}
          <div>
            <label className='block text-sm mb-2 text-gray-300'>
              Tỷ lệ hấp thụ CO₂ (tấn/năm){' '}
              <span className='text-red-400'>*</span>
            </label>
            <input
              type='number'
              step='0.1'
              min='0'
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
              placeholder='Ví dụ: 15.8'
              value={form.carbonAbsorptionRate}
              onChange={(e) =>
                updateField(
                  'carbonAbsorptionRate',
                  parseFloat(e.target.value) || 0,
                )
              }
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className='block text-sm mb-2 text-gray-300'>Mô tả</label>
            <textarea
              rows={4}
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500'
              placeholder='Mô tả đặc điểm, môi trường sống, ứng dụng.. .'
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          {/* IMAGE URL */}
          <div>
            <label className='block text-sm mb-2 text-gray-300'>
              URL hình ảnh
            </label>
            <input
              type='url'
              className='w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus: ring-green-500'
              placeholder='https://example.com/image.jpg'
              value={form.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt='Preview'
                className='mt-2 w-32 h-32 object-cover rounded-lg'
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        {/* BUTTONS */}
        <div className='flex justify-end gap-3 mt-6'>
          <button
            className='px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition'
            onClick={() => navigate('/tree-species')}
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
