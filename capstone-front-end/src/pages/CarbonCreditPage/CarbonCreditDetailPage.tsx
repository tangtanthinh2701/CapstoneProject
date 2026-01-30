import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { carbonCreditApi } from '../../models/carbonCredit.api';
import type { CarbonCredit, CreditAllocation } from '../../models/carbonCredit.model';

const statusBadge = (status?: string) => {
    switch (status) {
        case 'AVAILABLE':
            return 'bg-green-500/20 text-green-400 border border-green-500/30';
        case 'PENDING':
            return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
        case 'ISSUED':
            return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
        case 'SOLD_OUT':
            return 'bg-red-500/20 text-red-400 border border-red-500/30';
        case 'RETIRED':
            return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        default:
            return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
};

export default function CarbonCreditDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [credit, setCredit] = useState<CarbonCredit | null>(null);
    const [allocations, setAllocations] = useState<CreditAllocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Purchase Modal State
    const [showPurchase, setShowPurchase] = useState(false);
    const [purchaseQuantity, setPurchaseQuantity] = useState(1);
    const [purchaseNotes, setPurchaseNotes] = useState('');

    const loadData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const [creditRes, allocRes] = await Promise.all([
                carbonCreditApi.getById(id),
                carbonCreditApi.getAllocationsByCredit(id).catch(() => ({ data: [] }))
            ]);
            setCredit(creditRes.data);
            setAllocations(allocRes.data || []);
        } catch (err: any) {
            setError(err.message || 'Không tải được thông tin tín chỉ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleVerify = async () => {
        if (!credit || !window.confirm('Xác nhận xác thực và kích hoạt tín chỉ này?')) return;
        try {
            setActionLoading(true);
            await carbonCreditApi.verify(credit.id);
            alert('Đã xác thực và kích hoạt tín chỉ thành công!');
            loadData();
        } catch (err: any) {
            alert(err.message || 'Xác thực thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAllocate = async () => {
        if (!credit || !window.confirm('Xác nhận phân bổ tín chỉ này cho các chủ sở hữu dự án?')) return;
        try {
            setActionLoading(true);
            await carbonCreditApi.allocate(credit.id);
            alert('Đã phân bổ tín chỉ cho các chủ sở hữu thành công!');
            loadData();
        } catch (err: any) {
            alert(err.message || 'Phân bổ thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!credit) return;
        if (purchaseQuantity <= 0) {
            alert('Số lượng mua phải lớn hơn 0');
            return;
        }
        if (purchaseQuantity > (credit.creditsAvailable || 0)) {
            alert('Số lượng mua vượt quá số lượng khả dụng');
            return;
        }

        try {
            setActionLoading(true);
            await carbonCreditApi.purchase({
                creditId: credit.id,
                quantity: purchaseQuantity,
                notes: purchaseNotes
            });
            alert('Đặt mua tín chỉ thành công! Vui lòng kiểm tra lịch sử giao dịch.');
            setShowPurchase(false);
            setPurchaseQuantity(1);
            setPurchaseNotes('');
            loadData();
        } catch (err: any) {
            alert(err.message || 'Đặt mua thất bại: ' + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (value?: number | null) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    };

    if (loading) {
        return (
            <div className="flex bg-[#07150D] text-white min-h-screen items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !credit) {
        return (
            <div className="flex bg-[#07150D] text-white min-h-screen">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="bg-red-900/20 border border-red-500/50 p-10 rounded-3xl text-center max-w-xl mx-auto">
                        <span className="material-icons text-5xl text-red-500 mb-4">error_outline</span>
                        <h2 className="text-2xl font-bold text-white mb-2">Lỗi tải dữ liệu</h2>
                        <p className="text-gray-400 mb-8">{error || 'Không tìm thấy thông tin tín chỉ'}</p>
                        <button onClick={() => navigate('/credits')} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-all">Quay lại danh sách</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <Breadcrumbs
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Tín chỉ Carbon', href: '/credits' },
                        { label: credit.creditCode },
                    ]}
                />

                {/* HEADER */}
                <div className="flex flex-wrap justify-between items-start gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black tracking-tight">{credit.creditCode}</h1>
                            <span className={`px-4 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${statusBadge(credit.creditsStatus)}`}>
                                {credit.creditsStatus}
                            </span>
                        </div>
                        <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">MÃ TÍN CHỈ HỆ THỐNG: #{credit.id}</p>
                    </div>

                    <div className="flex gap-3">
                        {isAdmin && credit.creditsStatus === 'PENDING' && (
                            <button
                                onClick={handleVerify}
                                disabled={actionLoading}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2"
                            >
                                <span className="material-icons text-sm">verified</span>
                                XÁC THỰC NGAY
                            </button>
                        )}
                        {isAdmin && credit.creditsStatus === 'AVAILABLE' && allocations.length === 0 && (
                            <button
                                onClick={handleAllocate}
                                disabled={actionLoading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
                            >
                                <span className="material-icons text-sm">group_add</span>
                                PHÂN BỔ CHO CHỦ SỞ HỮU
                            </button>
                        )}
                        {!isAdmin && credit.creditsStatus === 'AVAILABLE' && (
                            <button
                                onClick={() => setShowPurchase(true)}
                                disabled={actionLoading}
                                className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-green-900/40 flex items-center gap-2 active:scale-95"
                            >
                                <span className="material-icons text-sm">shopping_cart</span>
                                ĐẶT MUA NGAY
                            </button>
                        )}
                        <button className="p-3 bg-[#0E2219] border border-[#1E3A2B] rounded-2xl hover:bg-[#13271F] transition-all text-gray-400">
                            <span className="material-icons">more_vert</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN INFO */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* PROJECT CARD */}
                        <div className="bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B] shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-green-500/5 rounded-full group-hover:bg-green-500/10 transition-all"></div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 text-green-500">
                                    <span className="material-icons text-3xl">forest</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Dự án liên kết</p>
                                    <h3 className="text-2xl font-black text-white">{credit.projectName || '—'}</h3>
                                    <p className="text-xs text-green-400 font-bold font-mono uppercase">{credit.projectCode || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Năm phát hành</p>
                                    <p className="text-lg font-black">{credit.issuanceYear}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tổng CO₂</p>
                                    <p className="text-lg font-black text-blue-400">{credit.totalCo2Tons?.toLocaleString()} Tấn</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tiêu chuẩn</p>
                                    <p className="text-lg font-black text-yellow-500">{credit.verificationStandard || 'VCS'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Khả dụng</p>
                                    <p className="text-lg font-black text-green-500">{credit.creditsAvailable?.toLocaleString()} Credits</p>
                                </div>
                            </div>
                        </div>

                        {/* ORIGINS TAB */}
                        <div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <span className="material-icons text-blue-400">inventory_2</span>
                                NGUỒN GỐC TỪ CÁC LÔ CÂY
                            </h3>
                            <div className="space-y-4">
                                {credit.origins?.map((origin, idx) => (
                                    <div key={idx} className="bg-[#0E2219] p-6 rounded-2xl border border-[#1E3A2B] hover:border-blue-500/30 transition-all flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-black border border-blue-500/20">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-200">{origin.farmName || 'Nông trại #' + origin.farmId}</div>
                                                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">BATCH CODE: {origin.batchCode || 'N/A'} (ID: {origin.batchId})</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-blue-400">{origin.quantity.toLocaleString()}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TÍN CHỈ ĐÓNG GÓP</div>
                                        </div>
                                    </div>
                                ))}
                                {!credit.origins?.length && (
                                    <div className="bg-[#0E2219] p-10 rounded-3xl border border-[#1E3A2B] border-dashed text-center opacity-50">
                                        <span className="material-icons text-4xl mb-2">warning_amber</span>
                                        <p className="text-sm font-bold">KHÔNG CÓ DỮ LIỆU NGUỒN GỐC</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ALLOCATIONS TAB */}
                        {isAdmin && allocations.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 uppercase tracking-tighter">
                                    <span className="material-icons text-purple-400">groups</span>
                                    BẢN PHÂN BỔ CHO CHỦ SỞ HỮU
                                </h3>
                                <div className="bg-[#0E2219] rounded-3xl border border-[#1E3A2B] overflow-hidden shadow-2xl">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#0A1812] border-b border-[#1E3A2B]">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Nhà đầu tư</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Tỷ lệ</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Tín chỉ phân bổ</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1E3A2B]">
                                            {allocations.map(alloc => (
                                                <tr key={alloc.id} className="hover:bg-[#13271F] transition-all">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-purple-400">{alloc.ownerName || 'N/A'}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">ID: {alloc.ownerId}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-black text-gray-400 italic">
                                                        {alloc.allocationPercentage}%
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="font-black text-white">{alloc.allocatedCredits.toLocaleString()}</div>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase">{(alloc.availableCredits || 0).toLocaleString()} RE-TRADEABLE</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {alloc.claimedAt ? (
                                                            <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full uppercase">ĐÃ NHẬN</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full uppercase">CHỜ NHẬN</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR INFO */}
                    <div className="space-y-8">
                        {/* STATS CARD */}
                        <div className="bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B] shadow-2xl">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 border-b border-[#1E3A2B] pb-4">Thống kê giao dịch</h4>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <p className="text-gray-400 text-sm font-bold">Credits Issued</p>
                                    <p className="text-xl font-black">{credit.creditsIssued?.toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-gray-400 text-sm font-bold">Credits Sold</p>
                                    <p className="text-xl font-black text-blue-400">{credit.creditsSold?.toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-gray-400 text-sm font-bold">Credits Retired</p>
                                    <p className="text-xl font-black text-gray-500">{credit.creditsRetired?.toLocaleString()}</p>
                                </div>
                                <div className="pt-4 border-t border-[#1E3A2B] flex justify-between items-end">
                                    <p className="text-white text-sm font-black uppercase">Khả dụng còn lại</p>
                                    <p className="text-2xl font-black text-green-500">{credit.creditsAvailable?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* PRICE CARD */}
                        <div className="bg-green-500/5 p-8 rounded-3xl border border-green-500/20 shadow-2xl relative overflow-hidden group hover:border-green-500/40 transition-all">
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-green-500/10 rounded-full"></div>
                            <h4 className="text-xs font-black text-green-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="material-icons text-sm">payments</span>
                                Thông tin giá
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Giá niêm yết</p>
                                    <p className="text-2xl font-black text-white">{formatCurrency(credit.basePricePerCredit)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Giá hiện tại</p>
                                    <p className="text-3xl font-black text-[#00FF88] italic">{formatCurrency(credit.currentPricePerCredit)}</p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-tighter">Tương đương ~ {credit.pricePerCredit || credit.currentPricePerCredit || '—'} USD</p>
                                </div>
                            </div>
                        </div>

                        {/* INFO CARD */}
                        <div className="bg-[#0E2219] p-8 rounded-3xl border border-[#1E3A2B]">
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">Ngày phát hành</span>
                                    <span className="font-bold">{credit.issuedAt ? new Date(credit.issuedAt).toLocaleDateString() : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">Lần cập nhật cuối</span>
                                    <span className="font-bold">{credit.updatedAt ? new Date(credit.updatedAt).toLocaleDateString() : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 font-bold">Giấy chứng nhận</span>
                                    <span className="font-bold text-blue-400 underline cursor-pointer">Xem PDF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* PURCHASE MODAL */}
            {showPurchase && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0E2219] border border-[#1E3A2B] rounded-[2rem] p-10 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                        <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter">Đặt mua Tín chỉ</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Purchase Order Formulation</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Số lượng tín chỉ mua</label>
                                <div className="flex items-center gap-4 bg-[#071811] p-2 rounded-2xl border border-[#1E3A2B]">
                                    <button
                                        onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center bg-[#0E2219] rounded-xl hover:text-green-500 transition-all font-black text-xl"
                                    >-</button>
                                    <input
                                        type="text"
                                        className="flex-1 bg-transparent text-center font-black text-2xl text-green-400 outline-none"
                                        value={purchaseQuantity}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            setPurchaseQuantity(val === '' ? 0 : parseInt(val));
                                        }}
                                    />
                                    <button
                                        onClick={() => setPurchaseQuantity(Math.min(credit.creditsAvailable || 0, purchaseQuantity + 1))}
                                        className="w-12 h-12 flex items-center justify-center bg-[#0E2219] rounded-xl hover:text-green-500 transition-all font-black text-xl"
                                    >+</button>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 font-bold italic">Tối đa có sẵn: {(credit.creditsAvailable || 0).toLocaleString()} credits</p>
                            </div>

                            <div className="p-5 bg-green-500/5 rounded-2xl border border-green-500/10">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500 font-bold uppercase">Thành tiền</span>
                                    <span className="text-xl font-black text-green-500">{formatCurrency((credit.currentPricePerCredit || 0) * purchaseQuantity)}</span>
                                </div>
                                <p className="text-[10px] text-gray-600 text-right uppercase font-bold tracking-tighter">Đơn giá: {formatCurrency(credit.currentPricePerCredit)} / credit</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ghi chú (Tùy chọn)</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-[#071811] border border-[#1E3A2B] rounded-2xl outline-none text-sm font-bold focus:border-green-500 transition-all h-24 resize-none"
                                    placeholder="Nhập nội dung yêu cầu mua..."
                                    value={purchaseNotes}
                                    onChange={(e) => setPurchaseNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowPurchase(false)}
                                    className="flex-1 py-4 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all"
                                >Hủy bỏ</button>
                                <button
                                    onClick={handlePurchase}
                                    disabled={actionLoading || purchaseQuantity <= 0}
                                    className="flex-[2] py-4 bg-green-500 text-black font-black rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : <><span className="material-icons text-sm">check_circle</span> XÁC NHẬN MUA</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
