import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserMenuOpen(false);
  };

  return (
    <header className='fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100'>
      <nav className='max-w-7xl mx-auto px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          {/* Logo */}
          <div className='flex items-center space-x-2'>
            <div className='w-7 h-7 bg-gradient-to-br from-blue-500 to-teal-500 rounded-md shadow-sm'></div>
            <span className='text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent'>
              Treeverse
            </span>
          </div>

          {/* Menu desktop */}
          <div className='hidden md:flex items-center space-x-8'>
            {['Product', 'Solutions', 'Pricing', 'Resources'].map((item) => (
              <a
                key={item}
                href='#'
                className='text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors'
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className='hidden md:flex items-center space-x-4'>
            <button className='text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2'>
              Log In
            </button>
            <button className='text-sm font-semibold text-red-400 bg-blue-600 hover:bg-blue-700 transition-colors px-5 py-2 rounded-lg shadow-sm'>
              Sign Up
            </button>
          </div>

          {/* Mobile button */}
          <button
            className='md:hidden p-2 text-gray-700'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-100 animate-fadeIn'>
            <div className='flex flex-col space-y-3'>
              {['Product', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                <a
                  key={item}
                  href='#'
                  className='text-sm font-medium text-gray-700 text-center hover:text-blue-600 transition-colors'
                >
                  {item}
                </a>
              ))}

              <div className='pt-2 flex flex-col space-y-2'>
                <button className='text-sm font-semibold text-blue-600 text-center hover:text-blue-700'>
                  Log In
                </button>
                <button className='text-sm font-semibold text-red-400 bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg'>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
