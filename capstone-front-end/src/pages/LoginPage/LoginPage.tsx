export default function LoginPage() {
  return (
    <div className='flex min-h-screen'>
      {/* Left side - Login form */}
      <div className='w-full md:w-1/2 flex flex-col justify-center px-10 lg:px-20 bg-white'>
        <h1 className='text-3xl font-bold text-green-700 mb-2'>
          Welcome Back!
        </h1>
        <p className='text-gray-600 mb-8'>Log in to continue to Unite.</p>

        <form className='space-y-5'>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Email</label>
            <input
              type='email'
              placeholder='Email@company.com'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>Password</label>
            <input
              type='password'
              placeholder='Enter your password'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

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
            type='submit'
            className='w-full bg-green-700 text-white rounded-lg py-2 font-medium hover:bg-green-800 transition'
          >
            Log In
          </button>
        </form>

        <p className='text-center text-gray-600 mt-6'>
          Don’t have an account?{' '}
          <a href='#' className='text-green-700 font-semibold hover:underline'>
            Sign Up
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
