import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { treeBatchApi, type TreeBatch } from '../../models/treeBatch.api';
import { treeGrowthRecordApi, type TreeGrowthRecord, type GrowthRecordSummary } from '../../models/treeGrowthRecord.api';

export default function TreeBatchDetailPage() {
    const { id } = useParams();

    const [batch, setBatch] = useState<TreeBatch | null>(null);
    const [growthRecords, setGrowthRecords] = useState<TreeGrowthRecord[]>([]);
    const [co2Summary, setCo2Summary] = useState<GrowthRecordSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Growth record form
    const [showAddGrowth, setShowAddGrowth] = useState(false);
    const [editingRecord, setEditingRecord] = useState<TreeGrowthRecord | null>(null);
    const [newGrowth, setNewGrowth] = useState({
        recordedDate: new Date().toISOString().split('T')[0],
        avgHeightCm: 0,
        avgTrunkDiameterCm: 0,
        avgCanopyDiameterCm: 0,
        quantityDead: 0,
        healthStatus: 'HEALTHY',
        healthNotes: '',
    });

    const loadData = async () => {
        try {
            setLoading(true);
            if (!id) return;
            const batchId = parseInt(id);

            const [batchRes, growthRes, co2Res] = await Promise.all([
                treeBatchApi.getById(batchId),
                treeGrowthRecordApi.getByBatchId(batchId),
                treeGrowthRecordApi.getTotalCO2ByBatch(batchId)
            ]);

            setBatch(batchRes.data);
            setCo2Summary(co2Res.data);

            const records = growthRes.data || [];
            // Sort by date ascending
            setGrowthRecords(records.sort((a: any, b: any) =>
                new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime()
            ));

        } catch (err: any) {
            console.error('Error loading data:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleSaveGrowth = async () => {
        if (!id || !batch) return;
        try {
            if (editingRecord) {
                await treeGrowthRecordApi.update(editingRecord.id, {
                    ...newGrowth,
                    batchId: parseInt(id),
                });
                alert('Đã cập nhật ghi nhận tăng trưởng');
            } else {
                await treeGrowthRecordApi.create({
                    ...newGrowth,
                    batchId: parseInt(id),
                });
                alert('Đã thêm ghi nhận tăng trưởng');
            }
            setShowAddGrowth(false);
            setEditingRecord(null);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || err.message || 'Thất bại');
        }
    };

    const handleEdit = (record: TreeGrowthRecord) => {
        setEditingRecord(record);
        setNewGrowth({
            recordedDate: record.recordedDate.split('T')[0],
            avgHeightCm: record.avgHeightCm,
            avgTrunkDiameterCm: record.avgTrunkDiameterCm,
            avgCanopyDiameterCm: record.avgCanopyDiameterCm,
            quantityDead: record.quantityDead,
            healthStatus: record.healthStatus,
            healthNotes: record.healthNotes,
        });
        setShowAddGrowth(true);
    };

    const handleRecalculateCO2 = async (recordId: number) => {
        try {
            await treeGrowthRecordApi.calculateCO2(recordId);
            alert('Đã tính toán lại CO2');
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || err.message || 'Thất bại');
        }
    };

    if (loading) return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-gray-400">Đang tải...</p>
                </div>
            </main>
        </div>
    );

    if (error && !batch) return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-icons text-6xl text-red-500 mb-4">error</span>
                    <h2 className="text-2xl font-bold">{error}</h2>
                    <button onClick={loadData} className="mt-4 bg-green-500 text-black px-4 py-2 rounded-lg">Thử lại</button>
                </div>
            </main>
        </div>
    );

    if (!batch) return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-icons text-6xl text-gray-600 mb-4">inventory_2</span>
                    <h2 className="text-2xl font-bold">Không tìm thấy lô cây</h2>
                </div>
            </main>
        </div>
    );

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0E2219] border border-[#1E3A2B] p-4 rounded-lg shadow-xl">
                    <p className="font-bold text-white mb-2">{new Date(label).toLocaleDateString('vi-VN')}</p>
                    {payload.map((p: any) => (
                        <p key={p.name} style={{ color: p.color }} className="text-sm">
                            {p.name}: {p.value} {p.unit || ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen flex flex-col">
                <Breadcrumbs
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Lô cây', href: '/tree-batches' },
                        { label: `${batch.batchCode}` },
                    ]}
                />

                <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Chi tiết Lô cây {batch.batchCode}</h1>
                        <div className="flex flex-wrap gap-4 text-sm font-medium">
                            <span className={`px-4 py-1.5 rounded-full border ${batch.batchStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                batch.batchStatus === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                }`}>
                                <span className="opacity-70 mr-1.5">Trạng thái:</span> {batch.batchStatus}
                            </span>
                            <span className="bg-[#0E2219] px-4 py-1.5 rounded-full border border-[#1E3A2B] text-gray-300">
                                <span className="opacity-70 mr-1.5">Ngày trồng:</span> {new Date(batch.plantingDate).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="bg-[#0E2219] px-4 py-1.5 rounded-full border border-[#1E3A2B] text-gray-300">
                                <span className="opacity-70 mr-1.5">Số lượng trồng:</span> {batch.quantityPlanted} cây
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setEditingRecord(null);
                            setNewGrowth({
                                recordedDate: new Date().toISOString().split('T')[0],
                                avgHeightCm: growthRecords.length > 0 ? growthRecords[growthRecords.length - 1].avgHeightCm : 0,
                                avgTrunkDiameterCm: growthRecords.length > 0 ? growthRecords[growthRecords.length - 1].avgTrunkDiameterCm : 0,
                                avgCanopyDiameterCm: growthRecords.length > 0 ? growthRecords[growthRecords.length - 1].avgCanopyDiameterCm : 0,
                                quantityDead: 0,
                                healthStatus: 'HEALTHY',
                                healthNotes: '',
                            });
                            setShowAddGrowth(true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-icons text-xl">add_chart</span>
                        Ghi nhận tăng trưởng
                    </button>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#0E2219] p-6 rounded-2xl border border-[#1E3A2B] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons text-6xl">eco</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2 font-medium">Tổng CO₂ hấp thụ</p>
                        <div className="flex items-end gap-2">
                            <h4 className="text-3xl font-bold text-green-500 tracking-tight">
                                {co2Summary?.totalCO2Kg.toFixed(2) || '0.00'}
                            </h4>
                            <span className="text-gray-500 text-sm mb-1">Kg</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 font-medium flex items-center gap-1">
                            <span className="material-icons text-xs">info</span>
                            ≈ {co2Summary?.totalCO2Tons.toFixed(4) || '0.0000'} Tấn
                        </p>
                    </div>

                    <div className="bg-[#0E2219] p-6 rounded-2xl border border-[#1E3A2B] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons text-6xl">history</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2 font-medium">Lần gần nhất (Kg)</p>
                        <div className="flex items-end gap-2">
                            <h4 className="text-3xl font-bold text-blue-400 tracking-tight">
                                {co2Summary?.latestCO2Kg.toFixed(2) || '0.00'}
                            </h4>
                            <span className="text-gray-500 text-sm mb-1">Kg</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 font-medium">
                            {co2Summary?.latestRecordDate ? new Date(co2Summary.latestRecordDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                    </div>

                    <div className="bg-[#0E2219] p-6 rounded-2xl border border-[#1E3A2B] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons text-6xl">park</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2 font-medium">Số cây hiện tại</p>
                        <div className="flex items-end gap-2">
                            <h4 className="text-3xl font-bold text-yellow-500 tracking-tight">
                                {growthRecords.length > 0 ? growthRecords[growthRecords.length - 1].quantityAlive : batch.quantityPlanted}
                            </h4>
                            <span className="text-gray-500 text-sm mb-1">Cây</span>
                        </div>
                        <div className="mt-3 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-500 rounded-full"
                                style={{ width: `${growthRecords.length > 0 ? ((growthRecords[growthRecords.length - 1].quantityAlive / batch.quantityPlanted) * 100) : 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-[#0E2219] p-6 rounded-2xl border border-[#1E3A2B] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-icons text-6xl">assignment</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2 font-medium">Mật độ theo dõi</p>
                        <h4 className="text-3xl font-bold tracking-tight text-white mb-2">
                            {growthRecords.length}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">Lần ghi nhận thông số</p>
                    </div>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Growth Chart */}
                    <div className="bg-[#0E2219] p-8 rounded-2xl border border-[#1E3A2B] shadow-xl">
                        <h3 className="text-lg font-bold mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-green-500 bg-green-500/10 p-2 rounded-xl">timeline</span>
                                Biểu đồ sinh trưởng
                            </div>
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthRecords}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A2B" vertical={false} />
                                    <XAxis
                                        dataKey="recordedDate"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('vi-VN')}
                                        stroke="#6B7280"
                                        fontSize={12}
                                        tick={{ fill: '#9CA3AF' }}
                                    />
                                    <YAxis stroke="#6B7280" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="avgHeightCm" name="Chiều cao (cm)" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="avgTrunkDiameterCm" name="ĐK Thân (cm)" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="avgCanopyDiameterCm" name="ĐK Tán (cm)" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Survival Chart */}
                    <div className="bg-[#0E2219] p-8 rounded-2xl border border-[#1E3A2B] shadow-xl">
                        <h3 className="text-lg font-bold mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-blue-500 bg-blue-500/10 p-2 rounded-xl">analytics</span>
                                Tỷ lệ sống & Hấp thụ CO₂
                            </div>
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthRecords}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A2B" vertical={false} />
                                    <XAxis
                                        dataKey="recordedDate"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('vi-VN')}
                                        stroke="#6B7280"
                                        fontSize={12}
                                        tick={{ fill: '#9CA3AF' }}
                                    />
                                    <YAxis yAxisId="left" stroke="#3B82F6" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar yAxisId="left" dataKey="quantityAlive" name="Số cây sống" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                                    <Bar yAxisId="right" dataKey="co2AbsorbedKg" name="CO₂ hấp thụ (kg)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* GROWTH RECORDS TABLE */}
                <div className="bg-[#0E2219] rounded-2xl border border-[#1E3A2B] overflow-hidden shadow-xl mb-12">
                    <div className="p-6 border-b border-[#1E3A2B] flex items-center justify-between bg-[#071811]/50">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-icons text-green-500">list_alt</span>
                            Lịch sử chi tiết thông số
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">Hiển thị {growthRecords.length} bản ghi</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#071811] text-gray-400 text-xs uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="px-6 py-5">Ngày ghi nhận</th>
                                    <th className="px-6 py-5 text-center">Tình trạng</th>
                                    <th className="px-6 py-5 text-center">Sống/Chết</th>
                                    <th className="px-6 py-5 text-center">H / Thân / Tán (cm)</th>
                                    <th className="px-6 py-5 text-center">CO₂ Hấp thụ (Kg)</th>
                                    <th className="px-6 py-5 text-right pr-8">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1E3A2B]">
                                {growthRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                            <span className="material-icons text-4xl mb-2 opacity-20">cloud_off</span>
                                            <p>Chưa có dữ liệu tăng trưởng cho lô cây này.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    [...growthRecords].reverse().map((record) => (
                                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-gray-100">{new Date(record.recordedDate).toLocaleDateString('vi-VN')}</p>
                                                <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">{record.healthNotes || 'No notes'}</p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${record.healthStatus === 'HEALTHY' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    record.healthStatus === 'DISEASED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${record.healthStatus === 'HEALTHY' ? 'bg-green-400' :
                                                        record.healthStatus === 'DISEASED' ? 'bg-red-400' : 'bg-yellow-400'
                                                        }`}></span>
                                                    {record.healthStatus === 'HEALTHY' ? 'KHỎE MẠNH' : record.healthStatus === 'DISEASED' ? 'BỆNH' : 'SUY YẾU'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-gray-200">
                                                        <span className="text-green-500">{record.quantityAlive}</span>
                                                        <span className="mx-1 opacity-20">|</span>
                                                        <span className="text-red-500">{record.quantityDead}</span>
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Sống / Chết</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center font-mono text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="px-2 py-0.5 bg-[#071811] rounded text-emerald-400 border border-emerald-500/20" title="Height">{record.avgHeightCm.toFixed(1)}</span>
                                                    <span className="px-2 py-0.5 bg-[#071811] rounded text-amber-400 border border-amber-500/20" title="Trunk">{record.avgTrunkDiameterCm.toFixed(1)}</span>
                                                    <span className="px-2 py-0.5 bg-[#071811] rounded text-purple-400 border border-purple-500/20" title="Canopy">{record.avgCanopyDiameterCm.toFixed(1)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-base font-black text-green-500 tracking-tight">{record.co2AbsorbedKg.toFixed(4)}</span>
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase">Kg CO₂</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 pr-8">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleRecalculateCO2(record.id)}
                                                        className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all border border-blue-500/20 hover:scale-105"
                                                        title="Tính toán lại CO2"
                                                    >
                                                        <span className="material-icons text-base">refresh</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(record)}
                                                        className="p-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-xl transition-all border border-yellow-500/20 hover:scale-105"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <span className="material-icons text-base">edit</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* GROWTH RECORD FORM MODAL */}
                {showAddGrowth && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-[2rem] p-8 md:p-10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        {editingRecord ? 'Cập nhật ghi nhận' : 'Ghi nhận thông số'}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1 font-medium">Báo cáo tình trạng phát triển sản phẩm</p>
                                </div>
                                <button onClick={() => { setShowAddGrowth(false); setEditingRecord(null); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <span className="material-icons text-gray-400">close</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest ml-1">Ngày ghi nhận</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 rounded-2xl bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none font-medium text-gray-200"
                                        value={newGrowth.recordedDate}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, recordedDate: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest ml-1">Số cây chết (+)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full pl-5 pr-12 py-4 rounded-2xl bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-red-500/50 outline-none font-bold text-red-400"
                                                value={newGrowth.quantityDead === 0 ? '' : newGrowth.quantityDead}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    setNewGrowth({ ...newGrowth, quantityDead: val === '' ? 0 : parseInt(val) });
                                                }}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-xs uppercase">Cây</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sức khỏe</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-5 py-4 rounded-2xl bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none appearance-none font-bold text-gray-200"
                                                value={newGrowth.healthStatus}
                                                onChange={(e) => setNewGrowth({ ...newGrowth, healthStatus: e.target.value })}
                                            >
                                                <option value="HEALTHY">Khỏe mạnh</option>
                                                <option value="DISEASED">Bị sâu bệnh</option>
                                                <option value="STRESSED">Kém phát triển</option>
                                            </select>
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-icons text-gray-600 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Chiều cao (cm)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-4 rounded-2xl bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none font-bold text-emerald-400 text-center"
                                            value={newGrowth.avgHeightCm === 0 ? '' : newGrowth.avgHeightCm}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                                setNewGrowth({ ...newGrowth, avgHeightCm: val === '' ? 0 : parseFloat(val) });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ĐK Thân (cm)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-4 rounded-2xl bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-amber-500 outline-none font-bold text-amber-400 text-center"
                                            value={newGrowth.avgTrunkDiameterCm === 0 ? '' : newGrowth.avgTrunkDiameterCm}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                                setNewGrowth({ ...newGrowth, avgTrunkDiameterCm: val === '' ? 0 : parseFloat(val) });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ĐK Tán (cm)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-4 rounded-2xl bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-purple-500 outline-none font-bold text-purple-400 text-center"
                                            value={newGrowth.avgCanopyDiameterCm === 0 ? '' : newGrowth.avgCanopyDiameterCm}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                                setNewGrowth({ ...newGrowth, avgCanopyDiameterCm: val === '' ? 0 : parseFloat(val) });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest ml-1">Ghi chú lâm sàng</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Ví dụ: Đã phun thuốc xử lý sâu rầy vào ngày 12/01..."
                                        className="w-full px-5 py-4 rounded-2xl bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none resize-none font-medium text-gray-300 placeholder:text-gray-700"
                                        value={newGrowth.healthNotes}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, healthNotes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={() => { setShowAddGrowth(false); setEditingRecord(null); }}
                                    className="flex-1 py-4 rounded-2xl hover:bg-white/5 transition-all border border-[#1E3A2B] font-bold text-gray-400 active:scale-[0.98]"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={handleSaveGrowth}
                                    className="flex-1 py-4 bg-green-500 hover:bg-green-600 active:scale-[0.98] transition-all text-black rounded-2xl font-black shadow-[0_12px_24px_-8px_rgba(34,197,94,0.4)]"
                                >
                                    {editingRecord ? 'Cập nhật ngay' : 'Lưu bản ghi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
