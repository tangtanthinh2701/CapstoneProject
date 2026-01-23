import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    const location = useLocation();

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex bg-[#07150D] text-white min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-gray-400">Đang kiểm tra đăng nhập...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role permission
    if (requiredRoles && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        return (
            <div className="flex bg-[#07150D] text-white min-h-screen items-center justify-center">
                <div className="text-center max-w-md">
                    <span className="material-icons text-6xl text-red-500 mb-4">block</span>
                    <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
                    <p className="text-gray-400 mb-6">
                        Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
                    </p>
                    <a
                        href="/dashboard"
                        className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition"
                    >
                        Về trang chủ
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
