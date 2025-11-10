import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Login success:', data);
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (error) {
      console.error(
        'Error during login:',
        error instanceof Error ? error.message : 'An error occurred',
      );
    }
  };

  return (
    <div className='flex min-h-screen'>
      <div className='w-1/2 flex flex-col justify-center items-center px-10 bg-white'>
        <h1 className='text-4xl font-bold text-green-700 mb-6'>
          Welcome Back!
        </h1>
        <p className='text-gray-600 mb-6'>Log in to continue to Treeverse.</p>

        <form className='w-full max-w-sm'>
          <label className='block mb-3'>
            <span className='text-gray-700'>User name</span>
            <input
              onChange={handleChange}
              name='username'
              type='username'
              placeholder='Enter your username'
              className='mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:border-green-700 focus:ring-1 focus:ring-green-700'
            />
          </label>

          <label className='block mb-4'>
            <span className='text-gray-700'>Password</span>
            <input
              onChange={handleChange}
              name='password'
              type='password'
              placeholder='Enter your password'
              className='mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:border-green-700 focus:ring-1 focus:ring-green-700'
            />
          </label>
          <div className='flex items-center justify-between text-sm'>
            <label className='flex items-center gap-2'>
              <input type='checkbox' className='rounded text-green-600' />
              <span>Remember me</span>
            </label>
            <a href='#' className='text-green-600 hover:underline'>
              Forgot Password?
            </a>
          </div>
          <button
            type='button'
            onClick={onSubmit}
            className='w-full bg-green-700 text-red-600 rounded-lg py-2 font-medium
             hover:bg-green-800 active:bg-green-600 transition-colors duration-200'
          >
            Log In
          </button>
          <p className='mt-6 text-center text-gray-600'>
            Don’t have an account?{' '}
            <a
              href='#'
              onClick={() => navigate('/signup')}
              className='text-blue-600 font-medium hover:underline'
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>

      <div className='w-1/2 bg-green-100 flex justify-center items-center'>
        <img
          src='https://images.unsplash.com/photo-1607746882042-944635dfe10e'
          alt='Illustration'
          className='rounded-lg shadow-lg w-3/4'
        />
      </div>
    </div>
  );
}
