import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { treeBatchApi, type TreeBatch } from '../../models/treeBatch.api';
import { farmApi } from '../../models/farm.api';

const statusBadge = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return 'bg-green-500/20 text-green-400';
        case 'COMPLETED':
            return 'bg-blue-500/20 text-blue-400';
        case 'REMOVED':
            return 'bg-red-500/20 text-red-400';
        default:
            return 'bg-gray-500/20 text-gray-300';
    }
};

export default function TreeBatchPage() {
    const navigate = useNavigate();
    const { isAdmin, hasRole, user } = useAuth();
    const isFarmer = hasRole(['FARMER']);

    const [batches, setBatches] = useState<TreeBatch[]>([]);
    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [batchRes, farmRes] = await Promise.all([
                treeBatchApi.getAll({ page: 0, size: 100 }),
                farmApi.getAll({ page: 0, size: 100 })
            ]);

            const batchData = (batchRes as any)?.data || batchRes || [];
            setBatches(Array.isArray(batchData) ? batchData : []);

            const farmData = (farmRes as any)?.data || farmRes || [];
            if (isFarmer) {
                setFarms(Array.isArray(farmData) ? farmData.filter((f: any) => f.createdBy === user?.id) : []);
            } else {
                setFarms(Array.isArray(farmData) ? farmData : []);
            }
        } catch (err: any) {
            setError(err.message || 'Không tải được danh sách lô cây');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Bạn có chắc muốn xóa lô cây này?')) return;
        try {
            await treeBatchApi.delete(id);
            await loadData();
        } catch (err: any) {
            alert(err.message || 'Xóa thất bại');
        }
    };

    const filtered = batches.filter(
        (b) =>
            b.batchCode.toLowerCase().includes(search.toLowerCase()) ||
            b.supplierName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8">
                <Breadcrumbs
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Quản lý lô cây' },
                    ]}
                />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Quản lý Lô cây</h1>
                        <p className="text-gray-400">Theo dõi các lô cây được trồng tại các nông trại.</p>
                    </div>

                    {(isAdmin || isFarmer) && (
                        <button
                            onClick={() => navigate('/tree-batches/new')}
                            className="bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
                        >
                            <span className="material-icons">add</span>
                            Thêm lô cây
                        </button>
                    )}
                </div>



                {/* FILTERS */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[300px] relative">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm theo mã lô, nhà cung cấp..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl">
                        <p>{error}</p>
                        <button onClick={loadData} className="mt-2 text-sm underline">Thử lại</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <span className="material-icons text-6xl mb-4 opacity-30">forest</span>
                        <p>Chưa có lô cây nào</p>
                    </div>
                ) : (
                    <div className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#1E3A2B]">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Mã lô</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Nông trại</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Số lượng</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ngày trồng</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Trạng thái</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((batch) => (
                                    <tr
                                        key={batch.id}
                                        className="border-b border-[#1E3A2B] hover:bg-[#13271F] transition cursor-pointer"
                                        onClick={() => navigate(`/tree-batches/${batch.id}`)}
                                    >
                                        <td className="px-6 py-4 font-mono text-green-400">{batch.batchCode}</td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {farms.find(f => f.id === batch.farmId)?.name || `ID: ${batch.farmId}`}
                                        </td>
                                        <td className="px-6 py-4">{batch.quantityPlanted}</td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {new Date(batch.plantingDate).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(batch.batchStatus)}`}>
                                                {batch.batchStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/tree-batches/${batch.id}/edit`); }}
                                                    className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded transition"
                                                    title="Chỉnh sửa"
                                                >
                                                    <span className="material-icons text-sm">edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(batch.id, e)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition"
                                                    title="Xóa"
                                                >
                                                    <span className="material-icons text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
