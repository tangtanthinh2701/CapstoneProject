import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import {
  getTreeSpeciesById,
  createTreeSpecies,
  updateTreeSpecies,
  type TreeSpeciesPayload,
} from '../../models/treeSpecies.api';
import { uploadService } from '../../services/upload.service';

interface FormData {
  name: string;
  scientificName: string;
  baseCarbonRate: number;
  description: string;
  imageUrl: string;
}

const defaultForm: FormData = {
  name: '',
  scientificName: '',
  baseCarbonRate: 0,
  description: '',
  imageUrl: '',
};

export default function TreeSpeciesFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getTreeSpeciesById(parseInt(id!));
        const data = (response as any)?.data || response;

        setForm({
          name: data.name || '',
          scientificName: data.scientificName || '',
          baseCarbonRate: data.baseCarbonRate || 0,
          description: data.description || '',
          imageUrl: data.imageUrl || '',
        });
      } catch (err: any) {
        setError(err.message || 'Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const updateField = (key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Upload file using the service
      const url = await uploadService.upload(file);

      // Update form with the returned URL
      updateField('imageUrl', url);
    } catch (err: any) {
      setError('Lỗi tải ảnh lên: ' + (err.message || 'Không xác định'));
    } finally {
      setUploading(false);
      // Reset input so user can select same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Vui lòng nhập tên loài cây');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: TreeSpeciesPayload = {
        name: form.name,
        scientificName: form.scientificName || undefined,
        baseCarbonRate: form.baseCarbonRate,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
      };

      if (isEdit) {
        await updateTreeSpecies(parseInt(id!), payload);
      } else {
        await createTreeSpecies(payload);
      }

      navigate('/tree-species');
    } catch (err: any) {
      setError(err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

      <main className="flex-1 p-10 max-w-3xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý loài cây', href: '/tree-species' },
            { label: isEdit ? 'Cập nhật' : 'Tạo mới' },
          ]}
        />

        <h1 className="text-3xl font-bold mb-2">
          {isEdit ? 'Cập nhật Loài Cây' : 'Thêm Loài Cây Mới'}
        </h1>
        <p className="text-gray-400 mb-8">
          Điền đầy đủ thông tin về loài cây trồng.
        </p>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="material-icons">error</span>
            <span>{error}</span>
          </div>
        )}

        <section className="mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Tên loài cây <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập tên cây"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">Tên khoa học</label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập tên khoa học"
                value={form.scientificName}
                onChange={(e) => updateField('scientificName', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Tỷ lệ hấp thụ CO₂ cơ bản (kg/năm)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="25"
                value={form.baseCarbonRate === 0 ? '' : form.baseCarbonRate}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  updateField('baseCarbonRate', val === '' ? 0 : parseFloat(val));
                }}
              />
            </div>

            {/* Image Upload Field */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">Hình ảnh</label>

              <div className="space-y-3">
                {/* Upload Button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-[#071811] border border-[#1E3A2B] rounded-xl hover:bg-[#13271F] transition text-sm flex items-center gap-2"
                  >
                    <span className="material-icons text-green-500">cloud_upload</span>
                    {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                  </button>
                  <span className="text-xs text-gray-500">hoặc nhập URL bên dưới</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* URL Input (fallback or manual entry) */}
                <input
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                />

                {/* Preview */}
                {form.imageUrl && (
                  <div className="relative mt-2 w-full h-48 bg-[#071811] rounded-xl border border-[#1E3A2B] overflow-hidden group">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <button
                      type="button"
                      onClick={() => updateField('imageUrl', '')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      title="Xóa ảnh"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">Mô tả</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Mô tả về loài cây..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            className="px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition"
            onClick={() => navigate('/tree-species')}
            disabled={saving || uploading}
          >
            Hủy
          </button>

          <button
            className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold flex items-center gap-2 transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={saving || uploading}
          >
            {saving ? (
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
