import { useState } from 'react';
import { type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
  }>({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRememberMe = (e: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const res = await fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error || 'Please enter your username and password!',
        );
        return;
      }
      localStorage.setItem(
        'user',
        JSON.stringify({
          fullname: data.fullName,
          username: data.username,
          userId: data.userId,
          token: data.token,
        }),
      );
      localStorage.setItem('token', data.token);
      if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', formData.username);
      } else {
        sessionStorage.setItem('token', data.token);
      }
      navigate('/home');
    } catch {
      setErrorMessage('Something went wrong');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-900 p-6'>
      <div className='bg-gray-800 rounded-2xl shadow-2xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden max-w-5xl w-full'>
        {/* Left image section */}
        <div className='hidden lg:block relative'>
          <img
            src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            alt='industrial'
            className='w-full h-full object-cover opacity-90'
          />
          <div className='absolute bottom-10 left-10 text-white'>
            <h2 className='text-3xl font-bold mb-2'>
              AI-Powered Oxygen Supply Management
            </h2>
            <p className='text-gray-300 max-w-xs'>
              Streamlining industrial gas procurement and logistics.
            </p>
          </div>
        </div>

        {/* Right login form */}
        <div className='p-10 flex flex-col justify-center text-white'>
          <div className='mb-8'>
            <h1 className='text-4xl font-bold mb-2'>Welcome Back!</h1>
            <p className='text-gray-400'>Log in to your account to continue</p>
          </div>

          <form className='space-y-6' onSubmit={onSubmit}>
            <div>
              <label className='text-sm'>Username</label>
              <input
                type='text'
                name='username'
                value={formData.username}
                onChange={handleChange}
                className='w-full mt-1 px-4 py-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-green-400 outline-none'
                placeholder='Enter your username'
              />
            </div>

            <div>
              <label className='text-sm'>Password</label>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className='w-full mt-1 px-4 py-3 rounded-lg bg-gray-700 focus:ring-2 focus:ring-green-400 outline-none'
                placeholder='Enter your password'
              />

              {errorMessage && (
                <p className='text-red-400 text-sm mt-1'>{errorMessage}</p>
              )}
            </div>

            <div className='flex items-center justify-between text-sm'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={rememberMe}
                  onChange={handleRememberMe}
                  className='accent-green-500'
                />
                Remember me
              </label>
              <a href='#' className='text-green-400 hover:underline'>
                Forgot Password?
              </a>
            </div>

            <button className='w-full py-3 bg-green-500 hover:bg-green-600 transition text-black font-semibold rounded-lg'>
              Login
            </button>
          </form>

          <p className='text-center text-gray-400 mt-6 text-sm'>
            Don’t have an account?{' '}
            <a
              href='#'
              onClick={() => navigate('/signup')}
              className='text-green-400 hover:underline'
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
