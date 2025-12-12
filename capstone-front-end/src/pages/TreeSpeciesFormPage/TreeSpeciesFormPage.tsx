import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useTreeSpeciesFormViewModel } from '../../viewmodels/useTreeSpeciesViewModel';

const CLIMATE_ZONES = ['TROPICAL', 'SUBTROPICAL', 'TEMPERATE'];
const SOIL_TYPES = ['LOAM', 'CLAY', 'SANDY'];

/* ================== DESIGN SYSTEM ================== */
const pageBg = 'bg-[#07150D] text-white min-h-screen';

const card = 'bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-6';

const sectionTitle =
  'text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4';

const label = 'block text-xs font-medium tracking-wide text-gray-300 mb-1';

const inputBase =
  'w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] text-sm text-gray-100 ' +
  'placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/30';

const checkboxBox =
  'flex items-center gap-2 px-3 py-2 rounded-lg bg-[#071811] border border-[#1E3A2B]';

const btnGreen =
  'px-6 py-3 rounded-xl bg-green-500 text-black font-semibold hover:bg-green-400';

const btnGray =
  'px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:text-white';

/* =================================================== */

export default function TreeSpeciesFormPage() {
  const navigate = useNavigate();
  const { form, updateField, toggleArrayValue, save, loading, error } =
    useTreeSpeciesFormViewModel();

  const submit = async () => {
    await save();
    navigate('/tree-species');
  };

  return (
    <div className={`flex ${pageBg}`}>
      <Sidebar />

      <main className='flex-1 p-10 max-w-6xl mx-auto'>
        {/* HEADER */}
        <h1 className='text-3xl font-bold mb-1'>Thêm Loại Cây Mới</h1>
        <p className='text-gray-400 mb-8'>
          Điền thông tin chi tiết để thêm hoặc cập nhật loại cây trong hệ thống.
        </p>

        <div className='space-y-8'>
          {/* ================= BASIC INFO ================= */}
          <section className={card}>
            <h2 className={sectionTitle}>Thông tin cơ bản</h2>

            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className={label}>Tên cây</label>
                <input
                  className={inputBase}
                  placeholder='Ví dụ: Lim Xanh'
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div>
                <label className={label}>Tên khoa học</label>
                <input
                  className={inputBase}
                  placeholder='Ví dụ: Erythrophleum fordii'
                  value={form.scientificName}
                  onChange={(e) =>
                    updateField('scientificName', e.target.value)
                  }
                />
              </div>
            </div>

            <div className='mt-4'>
              <label className={label}>Mô tả</label>
              <textarea
                className={`${inputBase} min-h-[120px]`}
                placeholder='Nhập mô tả chi tiết về loài cây...'
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </section>

          {/* ================= IMAGE & CARBON ================= */}
          <section className={card}>
            <h2 className={sectionTitle}>Hình ảnh & Carbon</h2>

            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className={label}>URL hình ảnh</label>
                <input
                  className={inputBase}
                  placeholder='https://example.com/image.jpg'
                  value={form.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                />
              </div>

              <div>
                <label className={label}>Tỷ lệ hấp thụ Carbon (kg/năm)</label>
                <input
                  type='number'
                  className={inputBase}
                  value={form.carbonAbsorptionRate}
                  onChange={(e) =>
                    updateField('carbonAbsorptionRate', Number(e.target.value))
                  }
                />
              </div>
            </div>
          </section>

          {/* ================= PHYSICAL ================= */}
          <section className={card}>
            <h2 className={sectionTitle}>Đặc điểm sinh học</h2>

            <div className='grid grid-cols-3 gap-6'>
              <div>
                <label className={label}>Chiều cao điển hình (m)</label>
                <input
                  type='number'
                  className={inputBase}
                  value={form.typicalHeight ?? ''}
                  onChange={(e) =>
                    updateField('typicalHeight', Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label className={label}>Đường kính (cm)</label>
                <input
                  type='number'
                  className={inputBase}
                  value={form.typicalDiameter ?? ''}
                  onChange={(e) =>
                    updateField('typicalDiameter', Number(e.target.value))
                  }
                />
              </div>

              <div>
                <label className={label}>Tuổi thọ (năm)</label>
                <input
                  type='number'
                  className={inputBase}
                  value={form.typicalLifespan ?? ''}
                  onChange={(e) =>
                    updateField('typicalLifespan', Number(e.target.value))
                  }
                />
              </div>
            </div>
          </section>

          {/* ================= REQUIREMENTS ================= */}
          <section className={card}>
            <h2 className={sectionTitle}>Yêu cầu sinh trưởng</h2>

            <div className='grid grid-cols-3 gap-6'>
              <div>
                <label className={label}>Tốc độ tăng trưởng</label>
                <select
                  className={inputBase}
                  value={form.growthRate}
                  onChange={(e) =>
                    updateField('growthRate', e.target.value as any)
                  }
                >
                  <option value='SLOW'>Chậm</option>
                  <option value='MEDIUM'>Trung bình</option>
                  <option value='FAST'>Nhanh</option>
                </select>
              </div>

              <div>
                <label className={label}>Yêu cầu nước</label>
                <select
                  className={inputBase}
                  value={form.waterRequirement}
                  onChange={(e) =>
                    updateField('waterRequirement', e.target.value as any)
                  }
                >
                  <option value='LOW'>Ít nước</option>
                  <option value='MEDIUM'>Trung bình</option>
                  <option value='HIGH'>Nhiều nước</option>
                </select>
              </div>

              <div>
                <label className={label}>Yêu cầu ánh sáng</label>
                <select
                  className={inputBase}
                  value={form.sunlightRequirement}
                  onChange={(e) =>
                    updateField('sunlightRequirement', e.target.value as any)
                  }
                >
                  <option value='FULL_SUN'>Toàn phần</option>
                  <option value='PARTIAL_SHADE'>Bán phần</option>
                  <option value='SHADE'>Bóng râm</option>
                </select>
              </div>
            </div>
          </section>

          {/* ================= MULTI SELECT ================= */}
          <section className={card}>
            <h2 className={sectionTitle}>Môi trường sinh trưởng</h2>

            <div className='grid grid-cols-2 gap-8'>
              <div>
                <p className={label}>Vùng khí hậu</p>
                <div className='flex gap-3 flex-wrap'>
                  {CLIMATE_ZONES.map((z) => (
                    <label key={z} className={checkboxBox}>
                      <input
                        type='checkbox'
                        checked={form.climateZones.includes(z)}
                        onChange={() => toggleArrayValue('climateZones', z)}
                      />
                      {z}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className={label}>Loại đất</p>
                <div className='flex gap-3 flex-wrap'>
                  {SOIL_TYPES.map((s) => (
                    <label key={s} className={checkboxBox}>
                      <input
                        type='checkbox'
                        checked={form.soilTypes.includes(s)}
                        onChange={() => toggleArrayValue('soilTypes', s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ================= FLAGS ================= */}
          <section className={card}>
            <h2 className={sectionTitle}>Trạng thái</h2>

            <div className='flex gap-6'>
              <label className={checkboxBox}>
                <input
                  type='checkbox'
                  checked={form.hasCommercialValue}
                  onChange={(e) =>
                    updateField('hasCommercialValue', e.target.checked)
                  }
                />
                Có giá trị thương mại
              </label>

              <label className={checkboxBox}>
                <input
                  type='checkbox'
                  checked={form.isActive}
                  onChange={(e) => updateField('isActive', e.target.checked)}
                />
                Kích hoạt
              </label>
            </div>
          </section>

          {error && <div className='text-red-400'>{error}</div>}

          {/* ================= ACTIONS ================= */}
          <div className='flex justify-end gap-4'>
            <button
              className={btnGray}
              onClick={() => navigate('/tree-species')}
            >
              Hủy
            </button>
            <button className={btnGreen} disabled={loading} onClick={submit}>
              {loading ? 'Đang lưu...' : 'Lưu Loại Cây'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
