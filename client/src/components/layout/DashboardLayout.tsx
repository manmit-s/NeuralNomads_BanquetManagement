import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-64 flex flex-1 flex-col">
                <TopBar />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
