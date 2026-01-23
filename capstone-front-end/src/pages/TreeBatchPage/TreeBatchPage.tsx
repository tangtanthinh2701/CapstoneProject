import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { treeBatchApi, type TreeBatch } from '../../models/treeBatch.api';

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
    const { isAdmin } = useAuth();

    const [batches, setBatches] = useState<TreeBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch all for now, ideally backend supports filtering
            const response = await treeBatchApi.getAll({ page: 0, size: 100 });
            const data = (response as any)?.data || response || [];
            setBatches(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'Không tải được danh sách lô cây');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

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

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/tree-batches/new')}
                            className="bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
                        >
                            <span className="material-icons">add</span>
                            Thêm lô cây
                        </button>
                    )}
                </div>

                {/* SEARCH */}
                <div className="mb-6 max-w-md relative">
                    <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Tìm theo mã lô, nhà cung cấp..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
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
                                            <button className="text-blue-400 hover:text-blue-300">
                                                <span className="material-icons">visibility</span>
                                            </button>
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
