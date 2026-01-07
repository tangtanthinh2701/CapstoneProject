import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface User {
  fullname: string;
  username: string;
  userId: string;
  token: string;
}
export default function Sidebar() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
      } catch {
        console.error('Cannot parse stored user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const menu = [
    { label: 'Tổng quan', path: '/dashboard', icon: 'dashboard' },
    { label: 'Dự án', path: '/projects', icon: 'inventory_2' },
    { label: 'Vườn ươm', path: '/farms', icon: 'local_florist' },
    { label: 'Loại cây', path: '/tree-species', icon: 'forest' },
    { label: 'Báo cáo', path: '/contracts', icon: 'summarize' },
    { label: 'Tín chỉ Carbon', path: '/credits', icon: 'co2' },
    { label: 'Giao dịch', path: '/payments', icon: 'payment' },
  ];

  return (
    <aside className='w-64 bg-[#07150D] border-r border-[#0E2219] flex flex-col p-6'>
      {/* USER */}
      <div className='flex items-center gap-3 mb-10'>
        <img
          src='https://lh3.googleusercontent.com/aida-public/AB6AXuDAafQH4TJ_25zX0IzmrmShg1YC3pTNcVaPfzq94Apa5gzXMB9lSU_g5NRGKQTcVcYPH1IBRpuZMHbT7D1AyIlXPZsoG63BOKDYtCRCpOBarXlTqFaaiPG61uGSO_p3U6OaNKIf4wjm3dpAjZ_Tv6XymXehwmTdQZE-80pbTi_wT3DsPnY5a962DYwwvddUvprF0NYnFB54YdsD9yP6x_Xt55nF7lwYOsOcEhMT2rzM0fBkK4Sc7D02mM-z2HO9stPODINpw6syCEJ9'
          className='w-12 h-12 rounded-full'
        />
        <div>
          <p className='font-semibold'>{user?.fullname ?? 'Chưa đăng nhập'}</p>
          <p className='text-gray-400 text-sm'>
            {' '}
            {user ? 'Quản trị viên' : '—'}
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className='flex flex-col gap-2'>
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#0E2219] transition ${
              location.pathname.startsWith(item.path) ? 'bg-[#0E2219]' : ''
            }`}
          >
            <span className='material-icons text-gray-300'>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* BOTTOM MENU */}
      <div className='mt-auto space-y-2 text-sm'>
        <Link
          to='/help'
          className='flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#0E2219] rounded-lg'
        >
          <span className='material-icons'>help</span>
          Trợ giúp
        </Link>

        <button
          onClick={handleLogout}
          className='flex w-full gap-3 px-4 py-2 text-red-300 hover:bg-[#0E2219] rounded-lg text-left'
        >
          <span className='material-icons'>logout</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
