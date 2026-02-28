import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    Calendar,
    Package,
    BarChart3,
    Building2,
    Settings,
    LogOut,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/", roles: ["OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"] },
    { label: "Branches", icon: Building2, path: "/branches", roles: ["OWNER"] },
    { label: "Leads Pipeline", icon: Users, path: "/leads", roles: ["OWNER", "BRANCH_MANAGER", "SALES"] },
    { label: "Bookings", icon: CalendarDays, path: "/bookings", roles: ["OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"] },
    { label: "Calendar", icon: Calendar, path: "/calendar", roles: ["OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"] },
    { label: "Inventory", icon: Package, path: "/inventory", roles: ["OWNER", "BRANCH_MANAGER", "OPERATIONS"] },
    { label: "Reports", icon: BarChart3, path: "/reports", roles: ["OWNER", "BRANCH_MANAGER"] },
    { label: "Settings", icon: Settings, path: "/settings", roles: ["OWNER"] },
];

export default function Sidebar() {
    const location = useLocation();
    const { user, signOut } = useAuthStore();
    const role = user?.role || "SALES";

    const filtered = navItems.filter((item) => item.roles.includes(role));

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-surface border-r border-border">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-gradient shadow-glow-sm">
                    <Sparkles className="h-5 w-5 text-black" />
                </div>
                <div>
                    <h1 className="font-display text-xl font-bold tracking-tight text-white">
                        EVENTORA
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                        Banquet Management
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {filtered.map((item) => {
                    const isActive =
                        item.path === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(item.path);

                    return (
                        <NavLink key={item.path} to={item.path} className="block relative">
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-gold-500"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                            )}
                            <div
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-gold-500/10 text-gold-400"
                                        : "text-muted hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className="h-[18px] w-[18px]" />
                                <span>{item.label}</span>
                            </div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="border-t border-border p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/20 text-gold-400 text-sm font-semibold">
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted truncate">
                            {role.replace("_", " ")}
                        </p>
                    </div>
                </div>
                <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
