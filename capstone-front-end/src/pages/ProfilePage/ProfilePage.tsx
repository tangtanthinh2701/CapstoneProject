import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { userApi, type User } from '../../models/user.api';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();

    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form data
    const [form, setForm] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
    });

    // Password change
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userApi.getProfile();
            const data = (response as any)?.data || response;
            setProfile(data);
            setForm({
                fullname: data.fullname || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || '',
                dateOfBirth: data.dateOfBirth?.split('T')[0] || '',
            });
        } catch (err: any) {
            setError(err.message || 'Không tải được thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            await userApi.updateProfile(form);
            setSuccess('Cập nhật thông tin thành công!');
            await loadProfile();
        } catch (err: any) {
            setError(err.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            await userApi.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });

            setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);

            // Logout after password change
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-[#07150D] text-white min-h-screen">
                <Sidebar />
                <main className="flex-1 p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                        <p className="text-gray-400">Đang tải...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-[#07150D] text-white min-h-screen">
            <Sidebar />

            <main className="flex-1 p-8 max-w-4xl mx-auto">
                <Breadcrumbs
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Thông tin cá nhân' },
                    ]}
                />

                <h1 className="text-3xl font-bold mb-2">Thông tin cá nhân</h1>
                <p className="text-gray-400 mb-8">Quản lý thông tin tài khoản của bạn</p>

                {/* ALERTS */}
                {error && (
                    <div className="mb-6 bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-2">
                        <span className="material-icons">error</span>
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto">
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-900/20 border border-green-500 text-green-200 px-4 py-3 rounded-xl flex items-center gap-2">
                        <span className="material-icons">check_circle</span>
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)} className="ml-auto">
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                )}

                {/* PROFILE CARD */}
                <div className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] p-6 mb-6">
                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-[#1E3A2B]">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                            <span className="material-icons text-green-500 text-4xl">person</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{profile?.fullname || authUser?.fullName}</h2>
                            <p className="text-gray-400">@{profile?.username}</p>
                            <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${profile?.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {profile?.role}
                            </span>
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-2 text-gray-300">Họ và tên</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={form.fullname}
                                    onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2 text-gray-300">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-2 text-gray-300">Số điện thoại</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-2 text-gray-300">Ngày sinh</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={form.dateOfBirth}
                                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Địa chỉ</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Nhập địa chỉ"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={saving}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons">save</span>
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* CHANGE PASSWORD */}
                <div className="bg-[#0E2219] rounded-xl border border-[#1E3A2B] p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span className="material-icons text-yellow-500">lock</span>
                            Đổi mật khẩu
                        </h3>
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="text-green-400 hover:text-green-300 text-sm"
                        >
                            {showPasswordForm ? 'Ẩn' : 'Hiện'}
                        </button>
                    </div>

                    {showPasswordForm && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm mb-2 text-gray-300">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-2 text-gray-300">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-2 text-gray-300">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 rounded-xl bg-[#071811] border border-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={saving}
                                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
                                >
                                    <span className="material-icons">vpn_key</span>
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
