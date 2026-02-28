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
            const { data } = await api.get("/branches");
            set({ branches: data.data, loading: false });
        } catch {
            set({ loading: false });
        }
    },

    setSelectedBranch: (id) => set({ selectedBranchId: id }),
}));
