import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim())
      newErrors.fullName = 'Họ và tên là bắt buộc.';

    if (!formData.username.trim())
      newErrors.username = 'Tên đăng nhập là bắt buộc.';

    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc.';
    else if (formData.password.length < 6)
      newErrors.password = 'Mật khẩu phải ít nhất 6 ký tự.';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp.';

    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email không đúng định dạng.';

    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc.';
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = 'Số điện thoại phải đúng 10 chữ số.';

    if (!formData.address.trim()) newErrors.address = 'Địa chỉ là bắt buộc.';

    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Ngày sinh là bắt buộc.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('http://localhost:8088/api/auth/register', {
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ api: data.error || data.message || 'Đăng ký thất bại.' });
        setLoading(false);
        return;
      }
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      setErrors({ api: 'Không thể kết nối server.' });
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-[#0A1A11] text-white px-10 py-6'>
      {/* HEADER */}
      <div className='flex items-center gap-2 mb-10'>
        <div className='w-4 h-4 bg-green-500 rounded-md'></div>
        <span className='text-lg font-semibold'>OxyAI Management</span>
      </div>

      {/* MAIN */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch'>
        {/* LEFT */}
        <div className='flex flex-col justify-between'>
          <div className='w-full h-[330px] rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 shadow-xl'></div>

          <div className='mt-10'>
            <h1 className='text-4xl font-extrabold mb-3'>
              Quản lý Oxy thông minh
            </h1>
            <p className='text-gray-300'>
              Tối ưu hóa quy trình, giám sát thời gian thực và đưa ra quyết định
              dựa trên dữ liệu.
            </p>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className='bg-[#0F251B] border border-[#1d3a29]/50 p-10 rounded-3xl shadow-2xl'>
          <h2 className='text-3xl font-bold mb-2'>Tạo tài khoản mới</h2>
          <p className='text-gray-400 mb-10 text-sm'>
            Bắt đầu giao dịch và quản lý oxy công nghiệp thông minh.
          </p>

          <form
            onSubmit={onSubmit}
            className='grid grid-cols-1 md:grid-cols-2 gap-6'
          >
            {/* Họ và tên */}
            <FormField
              label='Họ và tên'
              name='fullName'
              error={errors.fullName}
              value={formData.fullName}
              handleChange={handleChange}
            />

            {/* Username */}
            <FormField
              label='Tên đăng nhập'
              name='username'
              error={errors.username}
              value={formData.username}
              handleChange={handleChange}
            />

            {/* Password */}
            <PasswordField
              label='Mật khẩu'
              name='password'
              error={errors.password}
              value={formData.password}
              handleChange={handleChange}
            />

            {/* Confirm Password */}
            <PasswordField
              label='Nhập lại mật khẩu'
              name='confirmPassword'
              error={errors.confirmPassword}
              value={formData.confirmPassword}
              handleChange={handleChange}
            />

            {/* Email */}
            <FormField
              label='Email'
              name='email'
              error={errors.email}
              value={formData.email}
              handleChange={handleChange}
            />

            {/* Phone */}
            <FormField
              label='Số điện thoại'
              name='phone'
              error={errors.phone}
              value={formData.phone}
              handleChange={handleChange}
            />

            {/* DOB */}
            <FormField
              label='Ngày sinh'
              name='dateOfBirth'
              type='date'
              error={errors.dateOfBirth}
              value={formData.dateOfBirth}
              handleChange={handleChange}
            />

            {/* SEX */}
            <div>
              <label className='text-sm'>Giới tính</label>
              <select
                name='sex'
                value={formData.sex ? 'true' : 'false'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sex: e.target.value === 'true',
                  }))
                }
                className='mt-2 w-full px-4 py-3 rounded-xl bg-[#152E22] border border-[#244a37]'
              >
                <option value='true'>Nam</option>
                <option value='false'>Nữ</option>
              </select>
            </div>

            {/* Address */}
            <div className='md:col-span-2'>
              <label className='text-sm'>Địa chỉ</label>
              <textarea
                rows={3}
                name='address'
                value={formData.address}
                onChange={handleChange}
                className={`mt-2 w-full px-4 py-3 rounded-xl bg-[#152E22] border ${
                  errors.address ? 'border-red-500' : 'border-[#244a37]'
                }`}
                placeholder='Nhập địa chỉ của bạn'
              />
              {errors.address && (
                <p className='text-red-400 text-xs'>{errors.address}</p>
              )}
            </div>

            {/* BUTTON */}
            <div className='md:col-span-2 mt-4'>
              <button
                type='submit'
                disabled={loading}
                className={`w-full py-3 rounded-xl text-black font-semibold transition ${
                  loading ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>

              {errors.api && (
                <p className='text-red-400 text-sm text-center mt-2'>
                  {errors.api}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ========================
   FORM FIELD COMPONENT
======================== */
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  error?: string;
}

function FormField({
  label,
  name,
  type = 'text',
  value,
  handleChange,
  error,
}: FormFieldProps) {
  return (
    <div>
      <label className='text-sm'>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        className={`mt-2 w-full px-4 py-3 rounded-xl bg-[#152E22] border ${
          error ? 'border-red-500' : 'border-[#244a37]'
        }`}
        placeholder={`Nhập ${label.toLowerCase()}`}
      />
      {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
    </div>
  );
}

/* ========================
   PASSWORD FIELD COMPONENT
======================== */
interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

function PasswordField({
  label,
  name,
  value,
  handleChange,
  error,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className='text-sm'>{label}</label>

      <div className='relative'>
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          className={`mt-2 w-full px-4 py-3 rounded-xl bg-[#152E22] border ${
            error ? 'border-red-500' : 'border-[#244a37]'
          }`}
          placeholder={`Nhập ${label.toLowerCase()}`}
        />
        <span
          className='material-icons absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white'
          onClick={() => setShow(!show)}
        >
          {show ? 'visibility' : 'visibility_off'}
        </span>
      </div>

      {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
    </div>
  );
}
