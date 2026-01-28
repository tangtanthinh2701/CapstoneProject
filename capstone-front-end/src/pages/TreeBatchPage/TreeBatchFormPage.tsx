import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { treeBatchApi } from '../../models/treeBatch.api';
import { farmApi } from '../../models/farm.api';
import { getTreeSpeciesList } from '../../models/treeSpecies.api';

interface FormData {
    farmId: number;
    treeSpeciesId: number;
    quantityPlanted: number;
    plantingDate: string;
    plantingAreaM2: number;
    supplierName: string;
    unitCost: number;
    batchStatus: string;
    notes: string;
}

const defaultForm: FormData = {
    farmId: 0,
    treeSpeciesId: 0,
    quantityPlanted: 0,
    plantingDate: new Date().toISOString().split('T')[0],
    plantingAreaM2: 0,
    supplierName: '',
    unitCost: 0,
    batchStatus: 'ACTIVE',
    notes: '',
};

export default function TreeBatchFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<FormData>(defaultForm);
    const [farms, setFarms] = useState<any[]>([]);
    const [species, setSpecies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                const [farmRes, speciesRes] = await Promise.all([
                    farmApi.getAll({ page: 0, size: 100 }),
                    getTreeSpeciesList({ page: 0, size: 100 }),
                ]);

                setFarms((farmRes as any)?.data || farmRes || []);
                setSpecies((speciesRes as any)?.data || speciesRes || []);

                if (isEdit && id) {
                    const res = await treeBatchApi.getById(id);
                    const data = (res as any)?.data || res;
                    setForm({
                        farmId: data.farmId,
                        treeSpeciesId: data.treeSpeciesId,
                        quantityPlanted: data.quantityPlanted,
                        plantingDate: data.plantingDate?.split('T')[0] || '',
                        plantingAreaM2: data.plantingAreaM2 || 0,
                        supplierName: data.supplierName || '',
                        unitCost: data.unitCost || 0,
                        batchStatus: data.batchStatus || 'ACTIVE',
                        notes: data.notes || '',
                    });
                }
            } catch (err: any) {
                setError(err.message || 'Lỗi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [id, isEdit]);

    const updateField = (key: keyof FormData, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!form.farmId || !form.treeSpeciesId) {
            setError('Vui lòng chọn nông trại và loài cây');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await treeBatchApi.create(form);
            navigate('/tree-batches');
        } catch (err: any) {
            setError(err.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white text-center py-20">Đang tải...</div>;

    return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />
            <main className="flex-1 p-10 max-w-4xl mx-auto">
                <Breadcrumbs
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Lô cây', href: '/tree-batches' },
                        { label: isEdit ? 'Cập nhật' : 'Tạo mới' },
                    ]}
                />
                <h1 className="text-3xl font-bold mb-6">{isEdit ? 'Cập nhật Lô Cây' : 'Tạo Lô Cây Mới'}</h1>

                {error && (
                    <div className="mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
                        <span className="material-icons">error</span>{error}
                    </div>
                )}

                <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Nông trại *</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]"
                                value={form.farmId}
                                onChange={(e) => updateField('farmId', parseInt(e.target.value))}
                                disabled={isEdit}
                            >
                                <option value={0}>Chọn nông trại...</option>
                                {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Loài cây *</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]"
                                value={form.treeSpeciesId}
                                onChange={(e) => updateField('treeSpeciesId', parseInt(e.target.value))}
                                disabled={isEdit}
                            >
                                <option value={0}>Chọn loài cây...</option>
                                {species.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Số lượng cây *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]"
                                value={form.quantityPlanted === 0 ? '' : form.quantityPlanted}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    updateField('quantityPlanted', val === '' ? 0 : parseInt(val));
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Ngày trồng *</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]"
                                value={form.plantingDate}
                                onChange={(e) => updateField('plantingDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Diện tích (m2)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]"
                                value={form.plantingAreaM2 === 0 ? '' : form.plantingAreaM2}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                    updateField('plantingAreaM2', val === '' ? 0 : parseFloat(val));
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Nhà cung cấp giống</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]"
                                value={form.supplierName}
                                onChange={(e) => updateField('supplierName', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Chi phí mỗi cây</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]"
                                value={form.unitCost === 0 ? '' : form.unitCost}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                    updateField('unitCost', val === '' ? 0 : parseFloat(val));
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Trạng thái</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B]"
                                value={form.batchStatus}
                                onChange={(e) => updateField('batchStatus', e.target.value)}
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="REMOVED">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => navigate('/tree-batches')}
                            className="mr-4 px-6 py-3 rounded-xl hover:bg-[#13271F] transition text-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu lô cây'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
