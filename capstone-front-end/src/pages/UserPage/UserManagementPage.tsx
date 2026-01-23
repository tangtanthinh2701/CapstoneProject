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

    const handleChangeRole = async (user: User) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
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
                    <div className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#1E3A2B]">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Người dùng</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">SĐT</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Vai trò</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Trạng thái</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    <tr key={user.id} className="border-b border-[#1E3A2B] hover:bg-[#13271F] transition">
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4 text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-300">{user.phoneNumber || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${roleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleChangeRole(user)}
                                                    className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition"
                                                    title="Đổi vai trò"
                                                >
                                                    <span className="material-icons text-sm">admin_panel_settings</span>
                                                </button>
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
