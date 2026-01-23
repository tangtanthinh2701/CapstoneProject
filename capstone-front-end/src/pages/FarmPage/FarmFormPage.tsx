import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { farmApi, type Farm } from '../../models/farm.api';

const statusOptions = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Ngưng hoạt động' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
];

interface FormData {
  code: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  area: number;
  usableArea: number;
  soilType: string;
  climateZone: string;
  avgRainfall: number;
  avgTemperature: number;
  plantingDate: string;
  farmStatus: string;
}

const defaultForm: FormData = {
  code: '',
  name: '',
  description: '',
  location: '',
  latitude: 0,
  longitude: 0,
  area: 0,
  usableArea: 0,
  soilType: '',
  climateZone: '',
  avgRainfall: 0,
  avgTemperature: 0,
  plantingDate: '',
  farmStatus: 'ACTIVE',
};

export default function FarmFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // Load existing data for edit
  useEffect(() => {
    if (!isEdit) return;

    const loadData = async () => {
      try {
        setInitialLoading(true);
        const response = await farmApi.getById(id!);
        const data = (response as any)?.data || response;

        setForm({
          code: data.code || '',
          name: data.name || '',
          description: data.description || '',
          location: data.location || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          area: data.area || 0,
          usableArea: data.usableArea || 0,
          soilType: data.soilType || '',
          climateZone: data.climateZone || '',
          avgRainfall: data.avgRainfall || 0,
          avgTemperature: data.avgTemperature || 0,
          plantingDate: data.plantingDate || '',
          farmStatus: data.farmStatus || 'ACTIVE',
        });
      } catch (err: any) {
        setError(err.message || 'Không tải được dữ liệu');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const updateField = (key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Vui lòng nhập tên nông trại');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await farmApi.update(id!, form);
      } else {
        await farmApi.create(form);
      }

      navigate('/farms');
    } catch (err: any) {
      setError(err.message || 'Lưu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex bg-[#07150D] text-white min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#07150D] text-white min-h-screen">
      <Sidebar />

      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý nông trại', href: '/farms' },
            { label: isEdit ? 'Cập nhật' : 'Tạo mới' },
          ]}
        />

        <h1 className="text-3xl font-bold mb-2">
          {isEdit ? 'Cập nhật Nông trại' : 'Tạo Nông trại Mới'}
        </h1>
        <p className="text-gray-400 mb-8">
          Điền đầy đủ thông tin để {isEdit ? 'cập nhật' : 'tạo'} nông trại.
        </p>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="material-icons">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* BASIC INFO */}
        <section className="mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-green-500">info</span>
            Thông tin cơ bản
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Mã nông trại
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="FARM-001"
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Tên nông trại <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nông trại Rừng Xanh"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">Mô tả</label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Mô tả về nông trại..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Trạng thái</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.farmStatus}
                  onChange={(e) => updateField('farmStatus', e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">Ngày bắt đầu trồng</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.plantingDate}
                  onChange={(e) => updateField('plantingDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section className="mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-blue-500">location_on</span>
            Vị trí
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Địa chỉ</label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Xã ABC, Huyện XYZ, Tỉnh..."
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.latitude}
                  onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">Kinh độ (Longitude)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.longitude}
                  onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* AREA */}
        <section className="mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-yellow-500">terrain</span>
            Diện tích & Môi trường
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Tổng diện tích (m²)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.area}
                  onChange={(e) => updateField('area', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">Diện tích sử dụng (m²)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.usableArea}
                  onChange={(e) => updateField('usableArea', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Loại đất</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Đất phù sa"
                  value={form.soilType}
                  onChange={(e) => updateField('soilType', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">Vùng khí hậu</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhiệt đới gió mùa"
                  value={form.climateZone}
                  onChange={(e) => updateField('climateZone', e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#1E3A2B]">
          <button
            className="px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition"
            onClick={() => navigate('/farms')}
            disabled={loading}
          >
            Hủy
          </button>

          <button
            className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold flex items-center gap-2 transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <span className="material-icons">save</span>
                {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
