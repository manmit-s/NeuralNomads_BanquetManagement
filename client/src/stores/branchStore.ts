import { create } from "zustand";
import type { Branch } from "@/types";
import { DEMO_BRANCHES } from "@/data/demo";

interface BranchState {
    branches: Branch[];
    selectedBranchId: string | null;
    loading: boolean;
    fetchBranches: () => Promise<void>;
    setSelectedBranch: (id: string | null) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
    branches: DEMO_BRANCHES,
    selectedBranchId: null,
    loading: false,

    fetchBranches: async () => {
        // Demo mode — branches already loaded from centralized module
        set({ branches: DEMO_BRANCHES, loading: false });
    },

    setSelectedBranch: (id) => set({ selectedBranchId: id }),
}));
