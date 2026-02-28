import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Bell } from "lucide-react";

export default function TopBar() {
    const { user, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div>
                <h2 className="text-sm text-gray-500">
                    {user?.branch ? user.branch.name : "All Branches"}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                    <Bell size={20} />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                </button>

                <button
                    onClick={signOut}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </header>
    );
}
