import { create } from "zustand";
import type { User } from "@/types";
import api from "@/lib/api";

interface AuthState {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>;
    signOut: () => void;
    loadProfile: () => Promise<void>;
    isOwner: boolean;
    isManager: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    isOwner: false,
    isManager: false,

    signIn: async (email: string, password: string) => {
        set({ loading: true });
        try {
            const res = await api.post("/auth/signin", { email, password });
            const { user, token } = res.data.data;
            localStorage.setItem("access_token", token);
            set({
                user,
                loading: false,
                isOwner: user.role === "OWNER",
                isManager: user.role === "BRANCH_MANAGER",
            });
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    signUp: async (data: any) => {
        set({ loading: true });
        try {
            const res = await api.post("/auth/signup", data);
            const { user, token } = res.data.data;
            localStorage.setItem("access_token", token);
            set({
                user,
                loading: false,
                isOwner: user.role === "OWNER",
                isManager: user.role === "BRANCH_MANAGER",
            });
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    signOut: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, isOwner: false, isManager: false, loading: false });
        window.location.href = "/login";
    },

    loadProfile: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            set({ user: null, loading: false, isOwner: false, isManager: false });
            return;
        }
        try {
            const res = await api.get("/auth/profile", { timeout: 5000 });
            const user = res.data.data;
            if (user) {
                set({
                    user,
                    loading: false,
                    isOwner: user.role === "OWNER",
                    isManager: user.role === "BRANCH_MANAGER",
                });
            } else {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                set({ user: null, loading: false, isOwner: false, isManager: false });
            }
        } catch {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            set({ user: null, loading: false, isOwner: false, isManager: false });
        }
    },
}));
