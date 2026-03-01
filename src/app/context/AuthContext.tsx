import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';

export interface User {
    steamid: string;
    personaname: string;
    avatarfull: string;
    profileurl: string;
    isAdmin?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated via the backend session
        const checkAuth = async () => {
            try {
                const res = await api.get('/api/auth/me');
                if (res.data?.user) {
                    setUser({
                        steamid: res.data.user.steamId,
                        personaname: res.data.user.username,
                        avatarfull: res.data.user.avatar,
                        profileurl: res.data.user.profileUrl || `https://steamcommunity.com/profiles/${res.data.user.steamId}`,
                        isAdmin: res.data.user.isAdmin || false,
                    });
                }
            } catch {
                // Not authenticated
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = () => {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        window.location.href = `${backendUrl}/api/auth/steam`;
    };

    const logout = async () => {
        try {
            await api.get('/api/auth/logout');
        } catch {
            // ignore
        }
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
