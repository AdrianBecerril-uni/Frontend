import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../../lib/api';

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

const STORAGE_KEY = 'steamates_user';
const TOKEN_KEY = 'steamates_token';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check if we're returning from Steam login (URL has steamId param)
        const params = new URLSearchParams(window.location.search);
        const steamId = params.get('steamId');
        const token = params.get('token');

        if (steamId && token) {
            // Steam callback — extract user data from URL params
            const userData: User = {
                steamid: steamId,
                personaname: params.get('username') || 'Steam User',
                avatarfull: params.get('avatar') || '',
                profileurl: params.get('profileUrl') || `https://steamcommunity.com/profiles/${steamId}`,
            };
            setUser(userData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            localStorage.setItem(TOKEN_KEY, token); // <-- Guardamos el Token
            setLoading(false);

            // Clean the URL (remove query params)
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }

        // 2. Check localStorage for persisted session
        const stored = localStorage.getItem(STORAGE_KEY);
        const storedToken = localStorage.getItem(TOKEN_KEY);
        
        if (storedToken && stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.steamid) {
                    setUser(parsed);
                }
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        // 3. Fallback: verify the token validity with the backend
        const checkAuth = async () => {
            if (!localStorage.getItem(TOKEN_KEY)) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/api/auth/me');
                if (res.data?.user) {
                    const userData: User = {
                        steamid: res.data.user.steamId,
                        personaname: res.data.user.username,
                        avatarfull: res.data.user.avatar,
                        profileurl: res.data.user.profileUrl || `https://steamcommunity.com/profiles/${res.data.user.steamId}`,
                        isAdmin: res.data.user.isAdmin || false,
                    };
                    setUser(userData);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
                }
            } catch {
                // If it crashes (token expired or invalid)
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(TOKEN_KEY);
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
            await api.post('/api/auth/logout');
        } catch {
            // ignore
        }
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
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
