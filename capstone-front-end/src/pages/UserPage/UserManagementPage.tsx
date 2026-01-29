import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { userApi, type User } from '../../models/user.api';

const roleBadge = (role: string) => {
    switch (role) {
        case 'ADMIN':
            return 'bg-purple-500/20 text-purple-400';
        case 'USER':
            return 'bg-blue-500/20 text-blue-400';
        case 'FARMER':
            return 'bg-green-500/20 text-green-400';
        default:
            return 'bg-gray-500/20 text-gray-400';
    }
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userApi.getAll({ page: 0, size: 100 });
            const data = (response as any)?.data || response || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'Không tải được danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleToggleStatus = async (user: User) => {
        if (!window.confirm(`Bạn có chắc muốn ${user.isActive ? 'khóa' : 'kích hoạt'} tài khoản này?`)) return;

        try {
            await userApi.updateStatus(user.id, !user.isActive);
            await loadData();
        } catch (err: any) {
            alert(err.message || 'Thao tác thất bại');
        }
    };

    const handleUpdateRole = async (user: User, newRole: string) => {
        if (user.role === newRole) return;
        if (!window.confirm(`Chuyển vai trò của ${user.fullname} thành ${newRole}?`)) return;

        try {
            await userApi.updateRole(user.id, newRole);
            await loadData();
        } catch (err: any) {
            alert(err.message || 'Thao tác thất bại');
        }
    };

    const filtered = users.filter(
        (u) =>
            u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
            u.username?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex bg-[#07150D] min-h-screen text-white">
            <Sidebar />

            <main className="flex-1 p-8">
                <Breadcrumbs
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Quản lý người dùng' },
                    ]}
                />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
                        <p className="text-gray-400">Quản lý tài khoản người dùng trong hệ thống</p>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm theo tên, username, email..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0E2219] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                            <p className="text-gray-400">Đang tải...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl">
                        <p>{error}</p>
                        <button onClick={loadData} className="mt-2 text-sm underline">Thử lại</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <span className="material-icons text-6xl mb-4 opacity-30">people</span>
                        <p>Không tìm thấy người dùng nào</p>
                    </div>
                ) : (
                    <div className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-[#1E3A2B]">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 whitespace-nowrap">Người dùng</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 whitespace-nowrap">User ID (UUID)</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 whitespace-nowrap">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 whitespace-nowrap">SĐT</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 whitespace-nowrap">Vai trò</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 whitespace-nowrap">Trạng thái</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400 whitespace-nowrap">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    <tr key={user.id} className="border-b border-[#1E3A2B] hover:bg-[#13271F] transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                    <span className="material-icons text-green-500 text-sm">person</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{user.fullname}</p>
                                                    <p className="text-sm text-gray-400">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="text-[10px] text-gray-500 font-mono bg-[#071811] px-2 py-1 rounded border border-[#1E3A2B] max-w-[150px] truncate block" title={String(user.id)}>
                                                    {user.id}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(String(user.id));
                                                        alert('Đã sao chép UUID!');
                                                    }}
                                                    className="p-1.5 bg-[#1E3A2B] hover:bg-[#2A4D39] text-gray-400 hover:text-white rounded transition"
                                                    title="Sao chép UUID"
                                                >
                                                    <span className="material-icons text-xs">content_copy</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-300 whitespace-nowrap">{user.phoneNumber || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative inline-block group">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user, e.target.value)}
                                                    className={`
                                                        appearance-none pr-8 pl-3 py-1.5 text-xs font-bold rounded-lg border border-[#1E3A2B] 
                                                        bg-[#071811] hover:bg-[#13271F] transition-all cursor-pointer outline-none focus:ring-1 focus:ring-green-500/50
                                                        ${roleBadge(user.role)}
                                                    `}
                                                >
                                                    <option value="USER" className="bg-[#071811] text-blue-400">USER</option>
                                                    <option value="FARMER" className="bg-[#071811] text-green-400">FARMER</option>
                                                    <option value="ADMIN" className="bg-[#071811] text-purple-400">ADMIN</option>
                                                </select>
                                                <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none opacity-50">
                                                    expand_more
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full inline-block ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-2 rounded-lg transition ${user.isActive
                                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                        }`}
                                                    title={user.isActive ? 'Khóa tài khoản' : 'Kích hoạt'}
                                                >
                                                    <span className="material-icons text-sm">
                                                        {user.isActive ? 'block' : 'check_circle'}
                                                    </span>
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
