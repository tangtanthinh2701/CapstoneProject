import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [user, setUser] = useState<{ fullname: string } | null>(null);

  useEffect(() => {
    // Load user từ localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className='w-full sticky top-0 z-50 bg-[#07150D] border-b border-[#0D2218]'>
      <div className='flex items-center justify-between px-6 py-4'>
        {/* Logo */}
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded-full bg-green-500'></div>
          <span className='text-lg font-semibold'>OxyAI</span>
        </div>

        {/* Desktop Nav */}
        <nav className='hidden md:flex items-center gap-8 text-gray-300'>
          <Link to='/'>Trang chủ</Link>
          <Link to='/projects'>Dự án</Link>
          <Link to='/about'>Giới thiệu</Link>
          <Link to='/partners'>Đối tác</Link>
        </nav>

        {/* Desktop Buttons */}
        {!user ? (
          <div className='hidden md:flex items-center gap-4'>
            <Link
              to='/login'
              className='px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800'
            >
              Đăng nhập
            </Link>

            <Link
              to='/projects'
              className='px-4 py-2 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-600'
            >
              Xem các phiên đấu giá
            </Link>
          </div>
        ) : (
          /* USER DROPDOWN */
          <div className='relative hidden md:block'>
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className='flex items-center gap-2 px-4 py-2 bg-[#0D2218] rounded-lg hover:bg-[#123020]'
            >
              <span className='material-icons text-green-300'>
                account_circle
              </span>
              <span className='text-green-300'>{user.fullname}</span>
              <span className='material-icons'>expand_more</span>
            </button>

            {/* Menu */}
            {dropdownOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-[#0E2219] rounded-lg shadow-lg border border-[#1d3a29]'>
                <Link
                  to='/profile'
                  className='block px-4 py-2 hover:bg-[#153726] text-gray-200'
                >
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className='w-full text-left px-4 py-2 hover:bg-[#153726] text-red-400'
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen((p) => !p)}
          className='md:hidden flex items-center text-gray-300'
        >
          <span className='material-icons text-3xl'>menu</span>
        </button>
      </div>

      {/* Mobile menu list */}
      {mobileOpen && (
        <div className='md:hidden bg-[#0E2219] border-t border-[#113122] px-6 py-4 space-y-4'>
          <Link to='/' className='block text-gray-300'>
            Trang chủ
          </Link>
          <Link to='/projects' className='block text-gray-300'>
            Dự án
          </Link>
          <Link to='/about' className='block text-gray-300'>
            Giới thiệu
          </Link>
          <Link to='/partners' className='block text-gray-300'>
            Đối tác
          </Link>

          {!user ? (
            <>
              <Link
                to='/login'
                className='block text-gray-300 border border-gray-600 px-4 py-2 rounded-lg'
              >
                Đăng nhập
              </Link>
              <Link
                to='/projects'
                className='block bg-green-500 text-black px-4 py-2 rounded-lg font-semibold'
              >
                Xem các phiên đấu giá
              </Link>
            </>
          ) : (
            <>
              <div className='flex items-center gap-2'>
                <span className='material-icons text-gray-300'>
                  account_circle
                </span>
                <span>{user.fullname}</span>
              </div>

              <Link
                to='/profile'
                className='block text-gray-300 hover:text-white'
              >
                Thông tin cá nhân
              </Link>

              <button
                onClick={handleLogout}
                className='block text-left w-full text-red-400 hover:text-red-300'
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
