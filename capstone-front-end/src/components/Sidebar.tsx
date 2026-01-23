import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  // Menu items với phân quyền
  const allMenuItems = [
    { label: 'Tổng quan', path: '/dashboard', icon: 'dashboard', roles: ['ADMIN', 'USER'] },
    { label: 'Dự án', path: '/projects', icon: 'inventory_2', roles: ['ADMIN', 'USER'] },
    { label: 'Vườn ươm', path: '/farms', icon: 'local_florist', roles: ['ADMIN', 'USER'] },
    { label: 'Lô cây', path: '/tree-batches', icon: 'forest', roles: ['ADMIN', 'USER'] },
    { label: 'Loại cây', path: '/tree-species', icon: 'compost', roles: ['ADMIN', 'USER'] },
    { label: 'Hợp đồng', path: '/contracts', icon: 'description', roles: ['ADMIN', 'USER'] },
    { label: 'Phê duyệt HĐ', path: '/contracts/workflow', icon: 'assignment', roles: ['ADMIN'] },
    { label: 'Tín chỉ Carbon', path: '/credits', icon: 'co2', roles: ['ADMIN', 'USER'] },
    { label: 'Quản lý Users', path: '/users', icon: 'people', roles: ['ADMIN'] },
  ];

  // Lọc menu theo role
  const menu = allMenuItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 bg-[#07150D] border-r border-[#0E2219] flex flex-col p-6">
      {/* USER INFO */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="material-icons text-green-500 text-xl">person</span>
        </div>
        <div>
          <p className="font-semibold text-white">{user?.fullName ?? 'Chưa đăng nhập'}</p>
          <p className="text-gray-400 text-sm">
            {isAdmin ? 'Quản trị viên' : 'Người dùng'}
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-2 flex-1">
        {menu.map((item) => {
          // Logic active đặc biệt để tránh trùng lặp giữa /contracts và /contracts/workflow
          const isExactMatch = location.pathname === item.path;
          const isNestedMatch = item.path !== '/dashboard' &&
            location.pathname.startsWith(item.path) &&
            item.path !== '/contracts/workflow' && // Workflow tự lo cho nó
            !(item.path === '/contracts' && location.pathname.includes('/contracts/workflow')); // Contracts không nhận vơ workflow

          const isActive = isExactMatch || (isNestedMatch && !isExactMatch);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${isActive
                ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                : 'text-gray-400 hover:bg-[#0E2219] hover:text-white'
                }`}
            >
              <span className="material-icons">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM MENU */}
      <div className="border-t border-[#1E3A2B] pt-4 mt-4 space-y-2">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${location.pathname === '/profile'
            ? 'bg-green-500/20 text-green-400'
            : 'text-gray-300 hover:bg-[#0E2219]'
            }`}
        >
          <span className="material-icons">settings</span>
          <span>Cài đặt</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition w-full"
        >
          <span className="material-icons">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
