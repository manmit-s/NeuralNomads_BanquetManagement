import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../lib/api";
import type { User } from "../types";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    isOwner: boolean;
    isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load profile on mount if token exists
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            loadProfile();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadProfile() {
        try {
            const { data } = await api.get("/auth/profile");
            setUser(data.data);
        } catch {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        } finally {
            setLoading(false);
        }
    }

    async function signIn(email: string, password: string) {
        const { data } = await api.post("/auth/signin", { email, password });
        localStorage.setItem("access_token", data.data.session.accessToken);
        localStorage.setItem("refresh_token", data.data.session.refreshToken);
        setUser(data.data.user);
    }

    function signOut() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
        window.location.href = "/login";
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn,
                signOut,
                isOwner: user?.role === "OWNER",
                isManager: user?.role === "BRANCH_MANAGER",
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
