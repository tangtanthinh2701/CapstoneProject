import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
    sex: true,
    role: 'USER',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    let finalValue: any = value;
    if (name === 'sex') {
      finalValue = value === 'true';
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim())
      newErrors.fullName = 'Vui lòng nhập họ và tên';

    if (!formData.username.trim())
      newErrors.username = 'Vui lòng nhập tên đăng nhập';

    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email không hợp lệ';

    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = 'Số điện thoại phải có 10 chữ số';

    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';

    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6)
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = 'Mật khẩu không khớp';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullName,
          username: formData.username,
          password: formData.password,
          email: formData.email,
          phoneNumber: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          sex: formData.sex,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ api: data.error || data.message || 'Đăng ký thất bại' });
        setLoading(false);
        return;
      }

      // Success
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      setErrors({ api: 'Không thể kết nối đến máy chủ' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07150D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-[#0E2219] p-10 rounded-2xl border border-[#1E3A2B] shadow-2xl">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-white">Đăng ký tài khoản</h2>
          <p className="mt-2 text-sm text-gray-400">
            Tạo tài khoản để tham gia hệ thống
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className={`mt-1 block w-full px-4 py-3 bg-[#071811] border ${errors.fullName ? 'border-red-500' : 'border-[#1E3A2B]'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập"
                  className={`mt-1 block w-full px-4 py-3 bg-[#071811] border ${errors.username ? 'border-red-500' : 'border-[#1E3A2B]'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                />
                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  className={`mt-1 block w-full px-4 py-3 bg-[#071811] border ${errors.email ? 'border-red-500' : 'border-[#1E3A2B]'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className={`mt-1 block w-full px-4 py-3 bg-[#071811] border ${errors.phone ? 'border-red-500' : 'border-[#1E3A2B]'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ"
                className={`mt-1 block w-full px-4 py-3 bg-[#071811] border ${errors.address ? 'border-red-500' : 'border-[#1E3A2B]'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Ngày sinh
                </label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 bg-[#071811] border border-[#1E3A2B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Giới tính
                </label>
                <select
                  name="sex"
                  value={formData.sex.toString()}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 bg-[#071811] border border-[#1E3A2B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                >
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 bg-[#071811] border border-[#1E3A2B] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                >
                  <option value="USER">Người dùng</option>
                  <option value="FARMER">Chủ nông trại</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự"
                  className={`mt-1 block w-full px-4 py-3 bg-[#071811] border ${errors.password ? 'border-red-500' : 'border-[#1E3A2B]'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  className={`mt-1 block w-full px-4 py-3 bg-[#071811] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#1E3A2B]'
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {errors.api && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
              {errors.api}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-black bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-400">Đã có tài khoản? </span>
            <Link to="/login" className="font-medium text-green-400 hover:text-green-300">
              Đăng nhập ngay
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500 mt-6">
            <p>Bằng việc đăng ký, bạn đồng ý với <a href="#" className="hover:text-green-400 underline">Điều khoản dịch vụ</a> và <a href="#" className="hover:text-green-400 underline">Chính sách bảo mật</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}
