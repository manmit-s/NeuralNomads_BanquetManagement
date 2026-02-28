import { create } from "zustand";
import type { User } from "@/types";

// ── Demo user (bypass auth) ──
const DEMO_USER: User = {
    id: "demo-owner",
    email: "demo@eventora.com",
    name: "Raj Patel",
    phone: "+91-9876543210",
    role: "OWNER",
    isActive: true,
};

interface AuthState {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    loadProfile: () => Promise<void>;
    isOwner: boolean;
    isManager: boolean;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
    // Auto-login with demo user
    user: DEMO_USER,
    loading: false,
    isOwner: true,
    isManager: false,

    signIn: async (_email: string, _password: string) => {
        // Bypass — just set demo user
        localStorage.setItem("access_token", "DEMO_TOKEN");
        set({
            user: DEMO_USER,
            loading: false,
            isOwner: true,
            isManager: false,
        });
    },

    signOut: () => {
        localStorage.removeItem("access_token");
        set({ user: null, isOwner: false, isManager: false });
    },

    loadProfile: async () => {
        // Bypass — always return demo user
        localStorage.setItem("access_token", "DEMO_TOKEN");
        set({
            user: DEMO_USER,
            isOwner: true,
            isManager: false,
            loading: false,
        });
    },
}));
