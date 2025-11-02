import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: new Date().toISOString().split('T')[0],
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8088/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Nếu backend trả lỗi (400, 409,...)
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Register success:', data);

      // ✅ Nếu backend trả token, lưu lại (tùy API của bạn)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // ✅ Chuyển hướng sang trang home (hoặc login)
      navigate('/home');
    } catch (error) {
      console.error('Error during registration:', error.message);
    }
  };

  return (
    <div className='flex min-h-screen'>
      {/* Left side - Sign Up form */}
      <div className='w-full md:w-1/2 flex flex-col justify-center px-10 lg:px-20 bg-white'>
        <h1 className='text-3xl font-bold text-green-700 mb-2'>Join Unite!</h1>
        <p className='text-gray-600 mb-8'>Create your account.</p>

        <form className='space-y-5'>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              Full Name
            </label>
            <input
              onChange={handleChange}
              name='fullname'
              type='text'
              placeholder='Full Name'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>Username</label>
            <input
              onChange={handleChange}
              name='username'
              type='text'
              placeholder='Username'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>Password</label>
            <input
              onChange={handleChange}
              name='password'
              type='password'
              placeholder='Enter your password'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              Phone Number
            </label>
            <input
              onChange={handleChange}
              name='phoneNumber'
              type='tel'
              placeholder='Phone Number'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>Address</label>
            <input
              onChange={handleChange}
              name='address'
              type='text'
              placeholder='Address'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <button
            onClick={onSubmit}
            className='w-full bg-green-700 text-white rounded-lg py-2 font-medium hover:bg-green-800 transition'
          >
            Sign Up
          </button>
        </form>

        <p className='text-center text-gray-600 mt-6'>
          Already have an account?{' '}
          <a href='#' className='text-green-700 font-semibold hover:underline'>
            Log In
          </a>
        </p>
      </div>

      {/* Right side - Image */}
      <div className='hidden md:flex w-1/2 bg-pink-100 items-center justify-center'>
        <img
          src='https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=600&q=80'
          alt='Team illustration'
          className='rounded-xl shadow-lg max-w-sm'
        />
      </div>
    </div>
  );
}
