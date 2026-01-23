import { useState, useEffect } from 'react';
import { type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || data.message || 'Đăng nhập thất bại');
        return;
      }

      // Use AuthContext login
      login(data.token, {
        id: data.userId,
        username: data.username,
        fullName: data.fullName,
        role: data.role || 'USER',
      });

      // Remember me
      if (rememberMe) {
        localStorage.setItem('username', formData.username);
      }

      console.log('✅ Login successful');

      // Redirect to intended page or dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('❌ Login error:', error);
      setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07150D]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07150D] p-6">
      <div className="bg-[#0E2219] rounded-2xl shadow-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden max-w-5xl w-full border border-[#1E3A2B]">
        {/* Left image section */}
        <div className="hidden lg:block relative">
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop"
            alt="Forest"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07150D] to-transparent"></div>
          <div className="absolute bottom-10 left-10 text-white">
            <h2 className="text-3xl font-bold mb-2">
              Hệ thống quản lý tín chỉ Carbon
            </h2>
            <p className="text-gray-300 max-w-xs">
              Giải pháp toàn diện cho quản lý dự án trồng rừng và tín chỉ carbon
            </p>
          </div>
        </div>

        {/* Right login form */}
        <div className="p-10 flex flex-col justify-center text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Chào mừng trở lại!</h1>
            <p className="text-gray-400">Đăng nhập để tiếp tục</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="text-sm text-gray-300">Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-[#071811] border border-[#1E3A2B] focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Nhập mật khẩu"
                required
              />

              {errorMessage && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <span className="material-icons text-sm">error</span>
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-green-500"
                />
                <span className="text-gray-300">Ghi nhớ đăng nhập</span>
              </label>
              <a href="/forgot-password" className="text-green-400 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-green-500 hover:bg-green-600 transition text-black font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Chưa có tài khoản?{' '}
            <a href="/signup" className="text-green-400 hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
