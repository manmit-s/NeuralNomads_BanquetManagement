import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuthStore } from "@/stores/authStore";
import { useBranchStore } from "@/stores/branchStore";

export default function DashboardLayout() {
    const { user } = useAuthStore();
    const { fetchBranches } = useBranchStore();

    useEffect(() => {
        if (user?.role === "OWNER") {
            fetchBranches();
        }
    }, [user, fetchBranches]);

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col ml-64">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
