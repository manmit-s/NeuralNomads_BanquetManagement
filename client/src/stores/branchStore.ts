import { create } from "zustand";
import type { Branch } from "@/types";
import api from "@/lib/api";

interface BranchState {
    branches: Branch[];
    selectedBranchId: string | null;
    loading: boolean;
    fetchBranches: () => Promise<void>;
    setSelectedBranch: (id: string | null) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
    branches: [],
    selectedBranchId: null,
    loading: false,

    fetchBranches: async () => {
        set({ loading: true });
        try {
            const res = await api.get("/branches", { timeout: 5000 });
            const apiBranches = res.data?.data;
            if (Array.isArray(apiBranches)) {
                set({ branches: apiBranches, loading: false });
                return;
            }
        } catch (err: any) {
            console.warn("[BranchStore] API failed:", err.message);
        }
        set({ branches: [], loading: false });
    },

    setSelectedBranch: (id) => set({ selectedBranchId: id }),
}));
