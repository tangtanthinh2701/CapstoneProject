import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { projectApi } from '../../models/project.api';
import { farmApi } from '../../models/farm.api';
import { treeBatchApi } from '../../models/treeBatch.api';
import { carbonCreditApi } from '../../models/carbonCredit.api';
import { VerificationStandard } from '../../models/carbonCredit.model';

interface OriginForm {
    farmId: number;
    batchId: number;
    quantity: number;
}

interface FormData {
    projectId: number;
    issuanceYear: number;
    totalCo2Tons: number;
    creditsIssued: number;
    basePricePerCredit: number;
    currentPricePerCredit: number;
    verificationStandard: string;
    origins: OriginForm[];
}

export default function CarbonCreditFormPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [projects, setProjects] = useState<any[]>([]);
    const [farms, setFarms] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    const [form, setForm] = useState<FormData>({
        projectId: 0,
        issuanceYear: new Date().getFullYear(),
        totalCo2Tons: 0,
        creditsIssued: 0,
        basePricePerCredit: 0,
        currentPricePerCredit: 0,
        verificationStandard: 'VCS',
        origins: [{ farmId: 0, batchId: 0, quantity: 0 }],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projRes, farmRes, batchRes] = await Promise.all([
                    projectApi.getAll({ size: 100 }),
                    farmApi.getAll({ size: 100 }),
                    treeBatchApi.getAll({ size: 100 }),
                ]);
                setProjects(projRes.data || []);
                setFarms(farmRes.data || []);
                setBatches(batchRes.data || []);
            } catch (err) {
                console.error('Failed to fetch initial data', err);
            }
        };
        fetchData();
    }, []);

    const updateField = (field: keyof FormData, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const addOrigin = () => {
        setForm((prev) => ({
            ...prev,
            origins: [...prev.origins, { farmId: 0, batchId: 0, quantity: 0 }],
        }));
    };

    const removeOrigin = (index: number) => {
        setForm((prev) => ({
            ...prev,
            origins: prev.origins.filter((_, i) => i !== index),
        }));
    };

    const updateOrigin = (index: number, field: keyof OriginForm, value: number) => {
        const newOrigins = [...form.origins];
        newOrigins[index] = { ...newOrigins[index], [field]: value };
        setForm((prev) => ({ ...prev, origins: newOrigins }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.projectId === 0) {
            setError('Vui lòng chọn dự án');
            return;
        }
        if (form.origins.some(o => o.farmId === 0 || o.batchId === 0 || o.quantity <= 0)) {
            setError('Vui lòng điền đầy đủ và chính xác thông tin nguồn gốc (Farms, Batches, Quantity)');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await carbonCreditApi.create(form);
            alert('Phát hành tín chỉ carbon thành công!');
            navigate('/credits');
        } catch (err: any) {
            setError(err.message || 'Phát hành tín chỉ thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
                <Breadcrumbs
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Tín chỉ Carbon', href: '/credits' },
                        { label: 'Phát hành mới' },
                    ]}
                />

                <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight">PHÁT HÀNH TÍN CHỈ</h1>
                    <p className="text-gray-400 mt-2 font-medium uppercase text-xs tracking-widest">Carbon Credit Minting Board</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
                        <span className="material-icons">error_outline</span>
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10 pb-20">
                    {/* GENERAL INFO */}
                    <section className="bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B] shadow-2xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/5 -mr-16 -mt-16 rounded-full"></div>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="material-icons text-green-500">info</span>
                            Thông tin chung
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Dự án đầu tư *</label>
                                <select
                                    className="w-full px-5 py-4 bg-[#071811] border border-[#1E3A2B] rounded-2xl transition-all focus:border-green-500 outline-none font-bold"
                                    value={form.projectId}
                                    onChange={(e) => updateField('projectId', parseInt(e.target.value))}
                                >
                                    <option value={0}>-- Chọn dự án --</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Năm phát hành</label>
                                <input
                                    type="number"
                                    className="w-full px-5 py-4 bg-[#071811] border border-[#1E3A2B] rounded-2xl transition-all focus:border-green-500 outline-none font-bold"
                                    value={form.issuanceYear}
                                    onChange={(e) => updateField('issuanceYear', parseInt(e.target.value))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Tiêu chuẩn kiểm soát</label>
                                <select
                                    className="w-full px-5 py-4 bg-[#071811] border border-[#1E3A2B] rounded-2xl transition-all focus:border-green-500 outline-none font-bold"
                                    value={form.verificationStandard}
                                    onChange={(e) => updateField('verificationStandard', e.target.value)}
                                >
                                    {Object.keys(VerificationStandard).map((key) => (
                                        <option key={key} value={key}>{key}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* QUANTITY & PRICE */}
                    <section className="bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B] shadow-2xl">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="material-icons text-blue-500">show_chart</span>
                            Giá & Định lượng
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Tổng CO₂ (Tấn)</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-4 bg-[#071811] border border-[#1E3A2B] rounded-2xl transition-all focus:border-green-500 outline-none font-bold text-blue-400"
                                    placeholder="0.0"
                                    value={form.totalCo2Tons === 0 ? '' : form.totalCo2Tons}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                        updateField('totalCo2Tons', val === '' ? 0 : parseFloat(val));
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Số lượng tín chỉ cấp</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-4 bg-[#071811] border border-[#1E3A2B] rounded-2xl transition-all focus:border-green-500 outline-none font-bold text-green-400"
                                    placeholder="0"
                                    value={form.creditsIssued === 0 ? '' : form.creditsIssued}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        updateField('creditsIssued', val === '' ? 0 : parseInt(val));
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Giá niêm yết (USD/Credit)</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-4 bg-[#071811] border border-[#1E3A2B] rounded-2xl transition-all focus:border-green-500 outline-none font-bold text-yellow-500"
                                    placeholder="0.0"
                                    value={form.basePricePerCredit === 0 ? '' : form.basePricePerCredit}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                        const numericVal = val === '' ? 0 : parseFloat(val);
                                        setForm(prev => ({
                                            ...prev,
                                            basePricePerCredit: numericVal,
                                            currentPricePerCredit: numericVal
                                        }));
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Giá hiện tại (USD/Credit)</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full px-5 py-4 bg-[#13271F] border border-[#1E3A2B] rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed"
                                    value={form.currentPricePerCredit || 0}
                                />
                            </div>
                        </div>
                    </section>

                    {/* ORIGINS */}
                    <section className="bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B] shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-icons text-purple-500">assignment</span>
                                Nguồn gốc Tín chỉ (Origins)
                            </h2>
                            <button
                                type="button"
                                onClick={addOrigin}
                                className="text-xs font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest border border-purple-500/30 px-4 py-2 rounded-xl hover:bg-purple-500/5 transition-all"
                            >
                                + Thêm nguồn gốc
                            </button>
                        </div>

                        <div className="space-y-4">
                            {form.origins.map((origin, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-11 gap-4 items-end bg-[#071811] p-5 rounded-2xl border border-[#1E3A2B] group relative">
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-black text-gray-600 uppercase mb-2">Nông trại</label>
                                        <select
                                            className="w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl outline-none text-sm font-bold focus:border-purple-500 transition-all"
                                            value={origin.farmId}
                                            onChange={(e) => updateOrigin(idx, 'farmId', parseInt(e.target.value))}
                                        >
                                            <option value={0}>Chọn farm</option>
                                            {farms.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-black text-gray-600 uppercase mb-2">Lô cây (Batch)</label>
                                        <select
                                            className="w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl outline-none text-sm font-bold focus:border-purple-500 transition-all"
                                            value={origin.batchId}
                                            onChange={(e) => updateOrigin(idx, 'batchId', parseInt(e.target.value))}
                                        >
                                            <option value={0}>Chọn batch</option>
                                            {batches.filter(b => b.farmId === origin.farmId).map(b => (
                                                <option key={b.id} value={b.id}>{b.batchCode}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-600 uppercase mb-2">Số lượng</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-[#0E2219] border border-[#1E3A2B] rounded-xl outline-none text-sm font-bold text-center text-purple-400 focus:border-purple-500 transition-all"
                                            placeholder="0"
                                            value={origin.quantity === 0 ? '' : origin.quantity}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                updateOrigin(idx, 'quantity', val === '' ? 0 : parseInt(val));
                                            }}
                                        />
                                    </div>

                                    <div className="md:col-span-1 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeOrigin(idx)}
                                            disabled={form.origins.length <= 1}
                                            className="w-10 h-10 flex items-center justify-center text-red-500/30 hover:text-red-500 transition-all disabled:opacity-0"
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-6 text-[10px] text-gray-500 italic flex items-center gap-1 uppercase tracking-widest font-bold">
                            <span className="material-icons text-xs">help_outline</span>
                            Tổng số lượng tín chỉ từ các nguồn gốc phải khớp với số lượng tín chỉ cấp trên.
                        </p>
                    </section>

                    <div className="flex gap-4 pt-10">
                        <button
                            type="button"
                            onClick={() => navigate('/credits')}
                            className="flex-1 py-4 bg-[#0E2219] border border-[#1E3A2B] rounded-2xl font-bold hover:bg-[#13271F] transition-all active:scale-95 text-gray-400 uppercase tracking-widest text-xs"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4 bg-green-500 text-black font-black rounded-2xl hover:bg-green-400 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-icons text-sm">rocket_launch</span>
                                    Phát hành ngay
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
