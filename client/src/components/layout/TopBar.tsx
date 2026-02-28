import { Bell, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useBranchStore } from "@/stores/branchStore";
import { getInitials } from "@/lib/utils";

export default function TopBar() {
    const { user } = useAuthStore();
    const { branches, selectedBranchId, setSelectedBranch } = useBranchStore();
    const isOwner = user?.role === "OWNER";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 backdrop-blur-xl px-6">
            {/* Left side — Branch selector for owners */}
            <div className="flex items-center gap-4">
                {isOwner && branches.length > 0 && (
                    <div className="relative">
                        <select
                            className="appearance-none bg-card border border-border rounded-xl px-4 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-500/40 cursor-pointer"
                            value={selectedBranchId || ""}
                            onChange={(e) => setSelectedBranch(e.target.value || null)}
                        >
                            <option value="">All Branches</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notification bell */}
                <button className="relative p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold-500 ring-2 ring-surface" />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-gradient text-black text-sm font-bold">
                        {user ? getInitials(user.name) : "U"}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-white">
                            {user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted">
                            {user?.role?.replace("_", " ") || "Role"}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
