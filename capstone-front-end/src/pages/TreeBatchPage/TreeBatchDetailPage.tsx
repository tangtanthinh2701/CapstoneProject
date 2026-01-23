import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { treeGrowthApi, type TreeGrowthRecord } from '../../models/treeGrowth.api';
import { useAuth } from '../../contexts/AuthContext';

export default function TreeBatchDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isAdmin } = useAuth();

    const [batch, setBatch] = useState<TreeBatch | null>(null);
    const [growthRecords, setGrowthRecords] = useState<TreeGrowthRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Growth record form
    const [showAddGrowth, setShowAddGrowth] = useState(false);
    const [newGrowth, setNewGrowth] = useState({
        recordedDate: new Date().toISOString().split('T')[0],
        avgHeightCm: 0,
        avgTrunkDiameterCm: 0,
        avgCanopyDiameterCm: 0,
        quantityAlive: 0,
        healthStatus: 'HEALTHY',
        healthNotes: '',
    });

    const loadData = async () => {
        try {
            setLoading(true);
            if (!id) return;

            const [batchRes, growthRes] = await Promise.all([
                treeBatchApi.getById(id),
                treeGrowthApi.getRecordsByBatchId(id),
            ]);

            setBatch((batchRes as any)?.data || batchRes);

            const records = (growthRes as any)?.data || growthRes || [];
            // Sort by date ascending
            setGrowthRecords(records.sort((a: any, b: any) =>
                new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime()
            ));

            // Init quantity alive with current batch quantity if no records
            if (records.length === 0 && batchRes) {
                setNewGrowth(prev => ({
                    ...prev,
                    quantityAlive: (batchRes as any)?.data?.quantityPlanted || 0
                }));
            } else if (records.length > 0) {
                // Use last record's quantity
                setNewGrowth(prev => ({
                    ...prev,
                    quantityAlive: records[records.length - 1].quantityAlive
                }));
            }

        } catch (err: any) {
            setError(err.message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleAddGrowth = async () => {
        if (!id || !batch) return;
        try {
            await treeGrowthApi.create({
                ...newGrowth,
                batchId: parseInt(id),
            });
            alert('Đã thêm ghi nhận tăng trưởng');
            setShowAddGrowth(false);
            loadData();
        } catch (err: any) {
            alert(err.message || 'Thất bại');
        }
    };

    if (loading) return <div className="text-white text-center py-20">Đang tải...</div>;
    if (!batch) return <div className="text-white text-center py-20">Không tìm thấy lô cây</div>;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0E2219] border border-[#1E3A2B] p-4 rounded-lg shadow-xl">
                    <p className="font-bold text-white mb-2">{new Date(label).toLocaleDateString('vi-VN')}</p>
                    {payload.map((p: any) => (
                        <p key={p.name} style={{ color: p.color }} className="text-sm">
                            {p.name}: {p.value} {p.unit}
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
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <Breadcrumbs
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Lô cây', href: '/tree-batches' },
                        { label: batch.batchCode },
                    ]}
                />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Chi tiết Lô cây {batch.batchCode}</h1>
                        <p className="text-gray-400">
                            Ngày trồng: {new Date(batch.plantingDate).toLocaleDateString('vi-VN')} •
                            Số lượng ban đầu: {batch.quantityPlanted} cây
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAddGrowth(true)}
                        className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                    >
                        <span className="material-icons">add_chart</span>
                        Ghi nhận tăng trưởng
                    </button>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Growth Chart */}
                    <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <span className="material-icons text-green-500">show_chart</span>
                            Biểu đồ sinh trưởng
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthRecords}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A2B" />
                                    <XAxis
                                        dataKey="recordedDate"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('vi-VN')}
                                        stroke="#6B7280"
                                    />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="avgHeightCm" name="Chiều cao (cm)" stroke="#10B981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="avgTrunkDiameterCm" name="Đường kính thân (cm)" stroke="#F59E0B" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Survival Chart */}
                    <div className="bg-[#0E2219] p-6 rounded-xl border border-[#1E3A2B]">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <span className="material-icons text-blue-500">bar_chart</span>
                            Tỷ lệ sống & Hấp thụ CO₂
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthRecords}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A2B" />
                                    <XAxis
                                        dataKey="recordedDate"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('vi-VN')}
                                        stroke="#6B7280"
                                    />
                                    <YAxis yAxisId="left" stroke="#3B82F6" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="quantityAlive" name="Số cây sống" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="co2AbsorbedKg" name="CO₂ hấp thụ (kg)" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* GROWTH RECORD FORM MODAL */}
                {showAddGrowth && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Ghi nhận thông số tăng trưởng</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm mb-1 text-gray-400">Ngày ghi nhận</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 rounded-lg bg-[#071811] border border-[#1E3A2B]"
                                        value={newGrowth.recordedDate}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, recordedDate: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1 text-gray-400">Chiều cao TB (cm)</label>
                                        <input
                                            type="number" step="0.1"
                                            className="w-full px-3 py-2 rounded-lg bg-[#071811] border border-[#1E3A2B]"
                                            value={newGrowth.avgHeightCm}
                                            onChange={(e) => setNewGrowth({ ...newGrowth, avgHeightCm: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 text-gray-400">Đường kính thân (cm)</label>
                                        <input
                                            type="number" step="0.1"
                                            className="w-full px-3 py-2 rounded-lg bg-[#071811] border border-[#1E3A2B]"
                                            value={newGrowth.avgTrunkDiameterCm}
                                            onChange={(e) => setNewGrowth({ ...newGrowth, avgTrunkDiameterCm: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1 text-gray-400">Đường kính tán (cm)</label>
                                        <input
                                            type="number" step="0.1"
                                            className="w-full px-3 py-2 rounded-lg bg-[#071811] border border-[#1E3A2B]"
                                            value={newGrowth.avgCanopyDiameterCm}
                                            onChange={(e) => setNewGrowth({ ...newGrowth, avgCanopyDiameterCm: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 text-gray-400">Số cây còn sống</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 rounded-lg bg-[#071811] border border-[#1E3A2B]"
                                            value={newGrowth.quantityAlive}
                                            onChange={(e) => setNewGrowth({ ...newGrowth, quantityAlive: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm mb-1 text-gray-400">Tình trạng sức khỏe</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg bg-[#071811] border border-[#1E3A2B]"
                                        value={newGrowth.healthStatus}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, healthStatus: e.target.value })}
                                    >
                                        <option value="HEALTHY">Khỏe mạnh</option>
                                        <option value="DISEASED">Có dấu hiệu bệnh</option>
                                        <option value="STRESSED">Kém phát triển</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm mb-1 text-gray-400">Ghi chú</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg bg-[#071811] border border-[#1E3A2B]"
                                        value={newGrowth.healthNotes}
                                        onChange={(e) => setNewGrowth({ ...newGrowth, healthNotes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddGrowth(false)}
                                    className="px-4 py-2 rounded-lg hover:bg-white/5"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddGrowth}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg font-semibold"
                                >
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
