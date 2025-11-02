export default function SignUpPage() {
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
              type='text'
              placeholder='Full Name'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>Username</label>
            <input
              type='text'
              placeholder='Username'
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

          <div>
            <label className='block text-sm text-gray-700 mb-1'>
              Phone Number
            </label>
            <input
              type='tel'
              placeholder='Phone Number'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-700 mb-1'>Address</label>
            <input
              type='text'
              placeholder='Address'
              className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none'
            />
          </div>

          <button
            type='submit'
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
