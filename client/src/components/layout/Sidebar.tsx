import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    ClipboardList,
    Package,
    Receipt,
    BarChart3,
    Building2,
    UserCircle,
    UtensilsCrossed,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface NavItem {
    label: string;
    to: string;
    icon: React.ReactNode;
    roles: string[];
}

const navItems: NavItem[] = [
    { label: "Dashboard", to: "/", icon: <LayoutDashboard size={20} />, roles: ["OWNER", "BRANCH_MANAGER"] },
    { label: "Branches", to: "/branches", icon: <Building2 size={20} />, roles: ["OWNER"] },
    { label: "Leads", to: "/leads", icon: <Users size={20} />, roles: ["OWNER", "BRANCH_MANAGER", "SALES"] },
    { label: "Bookings", to: "/bookings", icon: <CalendarDays size={20} />, roles: ["OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"] },
    { label: "Events", to: "/events", icon: <UtensilsCrossed size={20} />, roles: ["OWNER", "BRANCH_MANAGER", "OPERATIONS"] },
    { label: "Calendar", to: "/calendar", icon: <CalendarDays size={20} />, roles: ["OWNER", "BRANCH_MANAGER", "SALES", "OPERATIONS"] },
    { label: "Inventory", to: "/inventory", icon: <Package size={20} />, roles: ["OWNER", "BRANCH_MANAGER", "OPERATIONS"] },
    { label: "Billing", to: "/billing", icon: <Receipt size={20} />, roles: ["OWNER", "BRANCH_MANAGER", "SALES"] },
    { label: "Reports", to: "/reports", icon: <BarChart3 size={20} />, roles: ["OWNER", "BRANCH_MANAGER"] },
];

export default function Sidebar() {
    const { user } = useAuth();

    const visibleItems = navItems.filter((item) =>
        user ? item.roles.includes(user.role) : false
    );

    return (
        <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
                <ClipboardList className="text-primary-600" size={28} />
                <span className="text-lg font-bold text-gray-900">BanquetPro</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) =>
                            cn("sidebar-link", isActive && "sidebar-link-active")
                        }
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User card */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-3">
                    <UserCircle size={36} className="text-gray-400" />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="truncate text-xs text-gray-500">{user?.role?.replace("_", " ")}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
