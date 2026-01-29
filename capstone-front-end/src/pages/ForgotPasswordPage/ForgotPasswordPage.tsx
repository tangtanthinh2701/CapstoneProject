import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'email' | 'otp' | 'newPassword'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOtp = async () => {
        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const res = await fetch('http://localhost:8088/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gửi OTP thất bại');
            }

            setSuccess('Mã OTP đã được gửi đến email của bạn');
            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            setError('Vui lòng nhập mã OTP');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const res = await fetch('http://localhost:8088/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Mã OTP không đúng');
            }

            setSuccess('Xác thực thành công');
            setStep('newPassword');
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ mật khẩu');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const res = await fetch('http://localhost:8088/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Đổi mật khẩu thất bại');
            }

            setSuccess('Đổi mật khẩu thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#07150D] p-6">
            <div className="bg-[#0E2219] rounded-2xl shadow-2xl p-10 max-w-md w-full border border-[#1E3A2B]">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <span className="text-green-500 text-2xl">🌿</span>
                        <span className="font-bold text-lg text-white">Carbon Credit System</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
                    <p className="text-gray-400 mt-2">
                        {step === 'email' && 'Nhập email để nhận mã xác thực'}
                        {step === 'otp' && 'Nhập mã OTP đã gửi đến email'}
                        {step === 'newPassword' && 'Tạo mật khẩu mới'}
                    </p>
                </div>

                {/* PROGRESS */}
                <div className="flex justify-center gap-2 mb-8">
                    {['email', 'otp', 'newPassword'].map((s, i) => (
                        <div
                            key={s}
                            className={`w-3 h-3 rounded-full transition ${step === s
                                ? 'bg-green-500'
                                : i < ['email', 'otp', 'newPassword'].indexOf(step)
                                    ? 'bg-green-500/50'
                                    : 'bg-gray-600'
                                }`}
                        />
                    ))}
                </div>

                {/* ERROR/SUCCESS */}
                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 text-red-200 rounded-lg text-sm flex items-center gap-2">
                        <span className="material-icons text-sm">error</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-900/20 border border-green-500 text-green-200 rounded-lg text-sm flex items-center gap-2">
                        <span className="material-icons text-sm">check_circle</span>
                        {success}
                    </div>
                )}

                {/* STEP 1: EMAIL */}
                {step === 'email' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-300">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none text-white"
                                placeholder="email@example.com"
                            />
                        </div>

                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi mã OTP'
                            )}
                        </button>
                    </div>
                )}

                {/* STEP 2: OTP */}
                {step === 'otp' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-300">Mã OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none text-white text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                        </button>

                        <button
                            onClick={() => setStep('email')}
                            className="w-full py-2 text-gray-400 hover:text-white text-sm"
                        >
                            ← Quay lại
                        </button>
                    </div>
                )}

                {/* STEP 3: NEW PASSWORD */}
                {step === 'newPassword' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-300">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none text-white"
                                placeholder="Ít nhất 6 ký tự"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-300">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none text-white"
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>

                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                )}

                {/* BACK TO LOGIN */}
                <p className="text-center text-gray-400 mt-6 text-sm">
                    Nhớ mật khẩu?{' '}
                    <Link to="/login" className="text-green-400 hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
