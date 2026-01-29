import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { farmApi } from '../../models/farm.api';

const statusOptions = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Ngưng hoạt động' },
  { value: 'CLOSED', label: 'Đóng cửa' },
];

interface FormData {
  code: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  area: number | string;
  usableArea: number | string;
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
  area: '',
  usableArea: '',
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
  const [fetchingAddress, setFetchingAddress] = useState(false);

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

      // Backend only needs these fields for create/update
      const payload = {
        name: form.name,
        description: form.description,
        location: form.location,
        area: parseFloat(String(form.area)) || 0,
        usableArea: parseFloat(String(form.usableArea)) || 0,
        farmStatus: form.farmStatus,
      };

      if (isEdit) {
        await farmApi.update(id!, payload);
      } else {
        await farmApi.create(payload);
      }

      navigate('/farms');
    } catch (err: any) {
      const backendMsg = err.response?.data?.message;
      setError(backendMsg || err.message || 'Lưu thất bại');
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

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isEdit ? 'Cập nhật Nông trại' : 'Tạo Nông trại Mới'}
            </h1>
            <p className="text-gray-400">
              {isEdit ? 'Thông tin chi tiết và chỉnh sửa nông trại.' : 'Điền đầy đủ thông tin để tạo nông trại mới.'}
            </p>
          </div>
          {isEdit && (
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-xs text-green-500 uppercase font-bold">Mã nông trại</p>
              <p className="font-mono text-white">{form.code}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="material-icons">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* BASIC INFO */}
            <section className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="material-icons text-green-500">info</span>
                Thông tin cơ bản
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    Tên nông trại <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập tên nông trại"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-300">Mô tả</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Mô tả về nông trại..."
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-sm mb-2 text-gray-300">Tổng diện tích (m²)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.area || ''}
                      placeholder="VD: 1000"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        updateField('area', val);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-300">Diện tích sử dụng (m²)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.usableArea || ''}
                      placeholder="VD: 800"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        updateField('usableArea', val);
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATION */}
            <section className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="material-icons text-blue-500">location_on</span>
                  Vị trí địa lý
                </h2>
                <button
                  onClick={() => {
                    if (!navigator.geolocation) {
                      setError('Trình duyệt không hỗ trợ Geolocation');
                      return;
                    }
                    setFetchingAddress(true);
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const { latitude, longitude } = position.coords;
                        // Still update these in state so they show up in 'Enriched' view if needed, 
                        // but they won't be sent in payload
                        updateField('latitude', latitude);
                        updateField('longitude', longitude);

                        try {
                          const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                          );
                          const data = await res.json();
                          if (data.display_name) {
                            updateField('location', data.display_name);
                          }
                        } catch (e) {
                          console.error("Could not fetch address", e);
                        } finally {
                          setFetchingAddress(false);
                        }
                      },
                      (err) => {
                        setError('Không thể lấy vị trí: ' + err.message);
                        setFetchingAddress(false);
                      }
                    );
                  }}
                  disabled={fetchingAddress}
                  className="text-sm bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <span className={`material-icons text-sm ${fetchingAddress ? 'animate-spin' : ''}`}>
                    {fetchingAddress ? 'sync' : 'my_location'}
                  </span>
                  {fetchingAddress ? 'Đang xác định...' : 'Lấy vị trí hiện tại'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-300">Địa chỉ cụ thể</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Xã ABC, Tỉnh..."
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                  <p className="mt-3 text-xs text-gray-500 italic flex items-center gap-1">
                    <span className="material-icons text-xs">info</span>
                    Tọa độ và dữ liệu môi trường sẽ được hệ thống tự động xác định dựa trên địa chỉ này.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* ENRICHED INFO (Read-only) */}
            {isEdit && (
              <section className="bg-green-500/5 p-6 rounded-xl border border-green-500/20">
                <h2 className="text-lg font-bold mb-5 flex items-start gap-2 text-[#00D064]">
                  <span className="material-icons text-xl">auto_awesome</span>
                  <span>Dữ liệu môi trường</span>
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-[#00D064]/30 transition-colors">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Loại đất</p>
                    <p className="font-semibold text-green-100">{form.soilType || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-[#00D064]/30 transition-colors">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Khí hậu</p>
                    <p className="font-semibold text-blue-200">{form.climateZone || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-[#00D064]/30 transition-colors">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Lượng mưa</p>
                      <p className="font-semibold text-yellow-200">{form.avgRainfall} mm</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-[#00D064]/30 transition-colors">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Nhiệt độ</p>
                      <p className="font-semibold text-red-300">{form.avgTemperature} °C</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ACTION BUTTONS */}
            <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
              <button
                className="w-full mb-3 px-6 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-black font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                ) : (
                  <span className="material-icons">save</span>
                )}
                {isEdit ? 'Cập nhật nông trại' : 'Lưu nông trại'}
              </button>
              <button
                className="w-full px-6 py-4 rounded-xl bg-[#071811] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition"
                onClick={() => navigate('/farms')}
                disabled={loading}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
