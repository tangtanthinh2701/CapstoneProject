import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { contractApi } from '../../models/contract.api';
import { projectApi, type Project } from '../../models/project.api';

const typeOptions = [
  { value: 'OWNERSHIP', label: 'Sở hữu' },
  { value: 'INVESTMENT', label: 'Đầu tư' },
  { value: 'SERVICE', label: 'Dịch vụ' },
  { value: 'CREDIT_PURCHASE', label: 'Mua tín chỉ' },
];

interface FormData {
  projectId: number;
  contractType: string;
  totalValue: number;
  startDate: string;
  endDate: string;
  durationYears: number;
  carbonCreditPercentage: number;
  isRenewable: boolean;
}

const defaultForm: FormData = {
  projectId: 0,
  contractType: 'OWNERSHIP',
  totalValue: 0,
  startDate: '',
  endDate: '',
  durationYears: 1,
  carbonCreditPercentage: 0,
  isRenewable: true,
};

export default function ContractFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(defaultForm);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load projects
        const projectsRes = await projectApi.getAll({ page: 0, size: 100 });
        const projectsData = (projectsRes as any)?.data || projectsRes || [];
        setProjects(Array.isArray(projectsData) ? projectsData : []);

        // Load contract for edit
        if (isEdit && id) {
          const contractRes = await contractApi.getById(id);
          const data = (contractRes as any)?.data || contractRes;

          setForm({
            projectId: data.projectId || 0,
            contractType: data.contractType || 'OWNERSHIP',
            totalValue: data.totalValue || 0,
            startDate: data.startDate?.split('T')[0] || '',
            endDate: data.endDate?.split('T')[0] || '',
            durationYears: data.durationYears || 1,
            carbonCreditPercentage: data.carbonCreditPercentage || 0,
            isRenewable: data.isRenewable ?? true,
          });
        }
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

  const handleSubmit = async () => {
    if (!form.projectId) {
      setError('Vui lòng chọn dự án');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await contractApi.create(form);
      navigate('/contracts');
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
            { label: 'Hợp đồng', href: '/contracts' },
            { label: isEdit ? 'Cập nhật' : 'Tạo mới' },
          ]}
        />

        <h1 className="text-3xl font-bold mb-2">
          {isEdit ? 'Cập nhật Hợp đồng' : 'Tạo Hợp đồng Mới'}
        </h1>
        <p className="text-gray-400 mb-8">
          Điền đầy đủ thông tin hợp đồng.
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
                Dự án <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.projectId}
                onChange={(e) => updateField('projectId', parseInt(e.target.value))}
              >
                <option value={0}>Chọn dự án...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Loại hợp đồng</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.contractType}
                  onChange={(e) => updateField('contractType', e.target.value)}
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">Giá trị (VND)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.totalValue === 0 ? '' : form.totalValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    updateField('totalValue', val === '' ? 0 : parseFloat(val));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">Ngày kết thúc</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">Thời hạn (năm)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.durationYears === 0 ? '' : form.durationYears}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    updateField('durationYears', val === '' ? 0 : parseInt(val));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">% Tín chỉ carbon</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.carbonCreditPercentage === 0 ? '' : form.carbonCreditPercentage}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    updateField('carbonCreditPercentage', val === '' ? 0 : parseFloat(val));
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRenewable"
                checked={form.isRenewable}
                onChange={(e) => updateField('isRenewable', e.target.checked)}
                className="w-5 h-5 accent-green-500"
              />
              <label htmlFor="isRenewable" className="text-gray-300">Cho phép gia hạn</label>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            className="px-6 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] text-gray-300 hover:bg-[#13271F] transition"
            onClick={() => navigate('/contracts')}
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
                Tạo hợp đồng
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
