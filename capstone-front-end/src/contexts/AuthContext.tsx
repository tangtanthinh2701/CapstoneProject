import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
export type UserRole = 'ADMIN' | 'USER' | 'FARMER';

export interface User {
    id: number | string;
    username: string;
    fullName: string;
    email?: string;
    role: UserRole;
    token: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (token: string, userData: Partial<User>) => void;
    logout: () => void;
    hasRole: (roles: UserRole[]) => boolean;
}

// ========================
// CONTEXT
// ========================
const AuthContext = createContext<AuthContextType | null>(null);

// ========================
// PROVIDER
// ========================
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser({
                        id: userData.userId || userData.id,
                        username: userData.username,
                        fullName: userData.fullname || userData.fullName,
                        email: userData.email,
                        role: userData.role || 'USER',
                        token: token,
                    });
                }
            } catch (error) {
                console.error('Error loading user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = (token: string, userData: Partial<User>) => {
        const newUser: User = {
            id: userData.id || 0,
            username: userData.username || '',
            fullName: userData.fullName || '',
            email: userData.email,
            role: userData.role || 'USER',
            token: token,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
            userId: newUser.id,
            username: newUser.username,
            fullname: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
        }));

        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setUser(null);
        window.location.href = '/login';
    };

    const hasRole = (roles: UserRole[]) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        logout,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ========================
// HOOK
// ========================
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
