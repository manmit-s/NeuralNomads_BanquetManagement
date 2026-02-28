import { create } from "zustand";
import type { Branch } from "@/types";
import { DEMO_BRANCHES } from "@/data/demo";
import api from "@/lib/api";

interface BranchState {
    branches: Branch[];
    selectedBranchId: string | null;
    loading: boolean;
    isDemo: boolean;
    fetchBranches: () => Promise<void>;
    setSelectedBranch: (id: string | null) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
    branches: DEMO_BRANCHES,
    selectedBranchId: null,
    loading: false,
    isDemo: true,

    fetchBranches: async () => {
        set({ loading: true });
        try {
            const res = await api.get("/branches", { timeout: 5000 });
            const apiBranches = res.data?.data;
            if (Array.isArray(apiBranches) && apiBranches.length > 0) {
                set({ branches: apiBranches, loading: false, isDemo: false });
                return;
            }
        } catch (err: any) {
            console.warn("[BranchStore] API failed, using demo branches:", err.message);
        }
        // Fallback to demo data
        set({ branches: DEMO_BRANCHES, loading: false, isDemo: true });
    },

    setSelectedBranch: (id) => set({ selectedBranchId: id }),
}));
