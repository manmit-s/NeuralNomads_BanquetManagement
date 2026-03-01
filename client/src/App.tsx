import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LeadsPage from "@/pages/leads/LeadsPage";
import BookingsPage from "@/pages/bookings/BookingsPage";
import NewBookingPage from "@/pages/bookings/NewBookingPage";
import EventDetailsPage from "@/pages/events/EventDetailsPage";
import CalendarPage from "@/pages/calendar/CalendarPage";
import InventoryPage from "@/pages/inventory/InventoryPage";
import BranchesPage from "@/pages/branches/BranchesPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import AIRevenuePage from "@/pages/ai-revenue/AIRevenuePage";
import BillingPage from "@/pages/billing/BillingPage";
import ReputationPage from "@/pages/reputation/ReputationPage";
import BranchHealthPage from "@/pages/branch-health/BranchHealthPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthStore();

    if (loading) return <LoadingSpinner fullScreen />;
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}

function AppRoutes() {
    const { user, loading, loadProfile, signOut } = useAuthStore();

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        const handleAuthExpired = () => {
            signOut();
        };
        window.addEventListener("auth-expired", handleAuthExpired);
        return () => window.removeEventListener("auth-expired", handleAuthExpired);
    }, [signOut]);

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />

            {/* Protected — Dashboard Layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/branches" element={<BranchesPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/bookings/new" element={<NewBookingPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/ai-revenue" element={<AIRevenuePage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/reputation" element={<ReputationPage />} />
                <Route path="/branch-health" element={<BranchHealthPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#17171C",
                        color: "#fff",
                        border: "1px solid #222228",
                        borderRadius: "12px",
                    },
                }}
            />
        </BrowserRouter>
    );
}
