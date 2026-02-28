import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import LeadsPage from "./pages/leads/LeadsPage";
import BookingsPage from "./pages/bookings/BookingsPage";
import EventsPage from "./pages/events/EventsPage";
import CalendarPage from "./pages/calendar/CalendarPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import BillingPage from "./pages/billing/BillingPage";
import BranchesPage from "./pages/branches/BranchesPage";
import ReportsPage from "./pages/reports/ReportsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

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
                <Route path="/events" element={<EventsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
                <Toaster position="top-right" />
            </AuthProvider>
        </BrowserRouter>
    );
}
