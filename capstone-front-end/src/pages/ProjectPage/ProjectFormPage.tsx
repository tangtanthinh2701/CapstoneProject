import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { projectApi, type Project, type ProjectPhase } from '../../models/project.api';

const statusOptions = [
  { value: 'PLANNING', label: 'Lập kế hoạch' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const phaseStatusOptions = [
  { value: 'PLANNING', label: 'Lập kế hoạch' },
  { value: 'PLANTING', label: 'Đang trồng' },
  { value: 'GROWING', label: 'Sinh trưởng' },
  { value: 'MATURE', label: 'Trưởng thành' },
  { value: 'HARVESTING', label: 'Thu hoạch' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
];

interface PhaseForm {
  phaseNumber: number;
  phaseName: string;
  description: string;
  phaseStatus: string;
  plannedStartDate: string;
  plannedEndDate: string;
  targetCo2Kg: number;
  budget: number;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  projectStatus: string;
  totalBudget: number;
  targetCo2Kg: number;
  isPublic: boolean;
  phases: PhaseForm[];
}

const defaultForm: FormData = {
  code: '',
  name: '',
  description: '',
  projectStatus: 'PLANNING',
  totalBudget: 0,
  targetCo2Kg: 0,
  isPublic: false,
  phases: [],
};

const defaultPhase: PhaseForm = {
  phaseNumber: 1,
  phaseName: '',
  description: '',
  phaseStatus: 'PLANNING',
  plannedStartDate: '',
  plannedEndDate: '',
  targetCo2Kg: 0,
  budget: 0,
};

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing data for edit
  useEffect(() => {
    if (!isEdit) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await projectApi.getById(id!);
        const data = (response as any)?.data || response;

        setForm({
          code: data.code || '',
          name: data.name || '',
          description: data.description || '',
          projectStatus: data.projectStatus || 'PLANNING',
          totalBudget: data.totalBudget || 0,
          targetCo2Kg: data.targetCo2Kg || 0,
          isPublic: data.isPublic || false,
          phases: (data.phases || []).map((p: any, idx: number) => ({
            phaseNumber: p.phaseNumber || idx + 1,
            phaseName: p.phaseName || '',
            description: p.description || '',
            phaseStatus: p.phaseStatus || 'PLANNING',
            plannedStartDate: p.plannedStartDate || '',
            plannedEndDate: p.plannedEndDate || '',
            targetCo2Kg: p.targetCo2Kg || 0,
            budget: p.budget || 0,
          })),
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

  const addPhase = () => {
    setForm((prev) => ({
      ...prev,
      phases: [...prev.phases, { ...defaultPhase, phaseNumber: prev.phases.length + 1 }],
    }));
  };

  const removePhase = (index: number) => {
    setForm((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index),
    }));
  };

  const updatePhaseField = (index: number, key: keyof PhaseForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      phases: prev.phases.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Vui lòng nhập tên dự án');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...form,
        phases: form.phases.map((p, idx) => ({
          ...p,
          phaseNumber: idx + 1,
        })),
      };

      if (isEdit) {
        await projectApi.update(id!, payload);
      } else {
        await projectApi.create(payload);
      }

      navigate('/projects');
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

      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản lý dự án', href: '/projects' },
            { label: isEdit ? 'Cập nhật' : 'Tạo mới' },
          ]}
        />

        <h1 className="text-3xl font-bold mb-2">
          {isEdit ? 'Cập nhật Dự án' : 'Tạo Dự án Mới'}
        </h1>
        <p className="text-gray-400 mb-8">
          Điền đầy đủ thông tin để {isEdit ? 'cập nhật' : 'tạo'} dự án trồng rừng.
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
                <label className="block text-sm mb-2 text-gray-300">Mã dự án</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="PRJ-001"
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Tên dự án <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Dự án Rừng Xanh"
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
                placeholder="Mô tả về dự án..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Trạng thái</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.projectStatus}
                  onChange={(e) => updateField('projectStatus', e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={form.isPublic}
                  onChange={(e) => updateField('isPublic', e.target.checked)}
                  className="w-5 h-5 accent-green-500"
                />
                <label htmlFor="isPublic" className="text-gray-300">Công khai cho mọi người</label>
              </div>
            </div>
          </div>
        </section>

        {/* TARGETS */}
        <section className="mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons text-blue-500">track_changes</span>
            Mục tiêu
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">Ngân sách (VND)</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.totalBudget}
                onChange={(e) => updateField('totalBudget', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-300">Mục tiêu CO₂ (kg)</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.targetCo2Kg}
                onChange={(e) => updateField('targetCo2Kg', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </section>

        {/* PHASES */}
        <section className="mb-8 bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="material-icons text-purple-500">timeline</span>
              Giai đoạn ({form.phases.length})
            </h2>
            <button
              onClick={addPhase}
              className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition flex items-center gap-2"
            >
              <span className="material-icons text-sm">add</span>
              Thêm giai đoạn
            </button>
          </div>

          {form.phases.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có giai đoạn nào</p>
          ) : (
            <div className="space-y-4">
              {form.phases.map((phase, index) => (
                <div key={index} className="p-4 bg-[#071811] rounded-lg border border-[#1E3A2B]">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Giai đoạn {index + 1}</h3>
                    <button
                      onClick={() => removePhase(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1 text-gray-400">Tên giai đoạn</label>
                      <input
                        className="w-full px-3 py-2 rounded-lg bg-[#0E2219] border border-[#1E3A2B] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Giai đoạn chuẩn bị"
                        value={phase.phaseName}
                        onChange={(e) => updatePhaseField(index, 'phaseName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-gray-400">Trạng thái</label>
                      <select
                        className="w-full px-3 py-2 rounded-lg bg-[#0E2219] border border-[#1E3A2B] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={phase.phaseStatus}
                        onChange={(e) => updatePhaseField(index, 'phaseStatus', e.target.value)}
                      >
                        {phaseStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-gray-400">Ngày bắt đầu</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 rounded-lg bg-[#0E2219] border border-[#1E3A2B] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={phase.plannedStartDate}
                        onChange={(e) => updatePhaseField(index, 'plannedStartDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-gray-400">Ngày kết thúc</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 rounded-lg bg-[#0E2219] border border-[#1E3A2B] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={phase.plannedEndDate}
                        onChange={(e) => updatePhaseField(index, 'plannedEndDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#1E3A2B]">
          <button
            className="px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition"
            onClick={() => navigate('/projects')}
            disabled={saving}
          >
            Hủy
          </button>

          <button
            className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold flex items-center gap-2 transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={saving}
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
