const Footer = () => {
  return (
    <footer className='bg-white text-gray-700 py-20 px-6 lg:px-8 border-t border-gray-200'>
      <div className='max-w-7xl mx-auto'>
        {/* Top Grid */}
        <div className='grid md:grid-cols-4 gap-12 mb-16'>
          {/* Brand + Address */}
          <div className='space-y-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md'></div>
              <span className='text-xl font-semibold text-gray-800'>
                Treeverse
              </span>
            </div>
            <div className='text-gray-500 text-sm leading-relaxed'>
              <p>500 Nguyen Luong Bang,</p>
              <p>Hoa Khanh Bac, Da Nang</p>
            </div>
            <div className='space-x-3 pt-2'>
              {['F', 'I', 'T', 'L', 'Y'].map((icon, i) => (
                <a
                  key={i}
                  href='#'
                  className='inline-flex w-9 h-9 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition'
                >
                  <span className='text-sm font-semibold'>{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className='text-lg font-semibold text-gray-800 mb-4'>
              Company
            </h4>
            <nav className='space-y-2 text-sm'>
              {['Our Story', 'Customers', 'Careers'].map((item) => (
                <a
                  key={item}
                  href='#'
                  className='block text-gray-500 hover:text-gray-800 transition'
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Get Started */}
          <div>
            <h4 className='text-lg font-semibold text-gray-800 mb-4'>
              Get Started
            </h4>
            <nav className='space-y-2 text-sm'>
              {[
                'Contact Us',
                'Start a Free Trial',
                'Watch Demo',
                'FAQ',
                'Terms & Conditions',
                'Privacy Policy',
              ].map((item) => (
                <a
                  key={item}
                  href='#'
                  className='block text-gray-500 hover:text-gray-800 transition'
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* App Download */}
          <div>
            <h4 className='text-lg font-semibold text-gray-800 mb-4'>
              Download Our App
            </h4>
            <div className='space-y-3'>
              {/* App Store */}
              <a
                href='#'
                className='block bg-black text-white rounded-xl px-4 py-3 flex items-center space-x-3 hover:opacity-90 transition'
              >
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg'
                  alt='Apple'
                  className='w-6 h-6'
                />
                <div className='text-left'>
                  <p className='text-xs text-gray-300'>Download on the</p>
                  <p className='font-semibold text-sm text-white'>App Store</p>
                </div>
              </a>

              {/* Google Play */}
              <a
                href='#'
                className='block bg-gray-900 text-white rounded-xl px-4 py-3 flex items-center space-x-3 hover:opacity-90 transition'
              >
                <img
                  src='https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg'
                  alt='Google Play'
                  className='w-6 h-6'
                />
                <div className='text-left'>
                  <p className='text-xs text-gray-300'>GET IT ON</p>
                  <p className='font-semibold text-sm text-white'>
                    Google Play
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className='border-t border-gray-200 pt-8 text-center text-sm text-gray-500'>
          <p>
            © 2025{' '}
            <span className='font-semibold text-gray-700'>Treeverse</span>. All
            rights reserved. Powered by{' '}
            <a href='#' className='text-blue-600 hover:underline'>
              Wix
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
