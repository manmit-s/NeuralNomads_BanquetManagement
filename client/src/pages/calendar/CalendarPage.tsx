import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    Users,
    X,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Booking } from "@/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });

    const loadBookings = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = new Date(year, month, 1).toISOString().split("T")[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
            const { data } = await api.get("/bookings", {
                params: { startDate, endDate, limit: 100 },
            });
            setBookings(data.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    // Calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];

        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return days;
    }, [year, month]);

    const getBookingsForDay = (day: number) =>
        bookings.filter((b) => {
            if (!b.eventDate) return false;
            const d = new Date(b.eventDate);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const selectedBookings = selectedDate
        ? getBookingsForDay(selectedDate.getDate())
        : [];

    return (
        <div>
            <PageHeader
                title="Calendar"
                subtitle="View your events schedule"
                icon={CalendarDays}
            />

            <div className="flex gap-6">
                {/* Calendar Grid */}
                <GlassCard className="flex-1">
                    <div className="p-6">
                        {/* Month navigation */}
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={prevMonth} className="btn-ghost p-2">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <h2 className="text-lg font-display font-semibold text-white">
                                {monthName} {year}
                            </h2>
                            <button onClick={nextMonth} className="btn-ghost p-2">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-2">
                            {DAY_NAMES.map((d) => (
                                <div key={d} className="text-center text-xs font-medium text-muted py-2">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Days grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, idx) => {
                                if (!day)
                                    return <div key={`e-${idx}`} className="h-24 rounded-lg" />;

                                const dayBookings = getBookingsForDay(day);
                                const hasConflict = dayBookings.length > 1;
                                const isSelected =
                                    selectedDate?.getDate() === day &&
                                    selectedDate?.getMonth() === month;

                                return (
                                    <button
                                        key={day}
                                        onClick={() =>
                                            setSelectedDate(new Date(year, month, day))
                                        }
                                        className={cn(
                                            "h-24 rounded-lg border border-transparent p-2 text-left transition-all hover:border-gold-500/20 relative",
                                            isToday(day) && "bg-gold-500/5 border-gold-500/20",
                                            isSelected && "border-gold-500/40 bg-gold-500/10",
                                            dayBookings.length > 0 && "bg-surface/80"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "text-xs font-medium",
                                                isToday(day) ? "text-gold-400" : "text-muted"
                                            )}
                                        >
                                            {day}
                                        </span>

                                        <div className="mt-1 space-y-0.5">
                                            {dayBookings.slice(0, 2).map((b) => (
                                                <div
                                                    key={b.id}
                                                    className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded truncate",
                                                        b.status === "CONFIRMED"
                                                            ? "bg-green-500/20 text-green-400"
                                                            : b.status === "TENTATIVE"
                                                                ? "bg-amber-500/20 text-amber-400"
                                                                : "bg-blue-500/20 text-blue-400"
                                                    )}
                                                >
                                                    {b.customerName}
                                                </div>
                                            ))}
                                            {dayBookings.length > 2 && (
                                                <span className="text-[10px] text-muted">
                                                    +{dayBookings.length - 2} more
                                                </span>
                                            )}
                                        </div>

                                        {hasConflict && (
                                            <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </GlassCard>

                {/* Side panel */}
                <AnimatePresence mode="wait">
                    {selectedDate && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-80"
                        >
                            <GlassCard>
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-white">
                                            {selectedDate.toLocaleDateString("en", {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedDate(null)}
                                            className="text-muted hover:text-white transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {selectedBookings.length === 0 ? (
                                        <p className="text-sm text-muted py-8 text-center">
                                            No events on this date
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedBookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className="p-3 rounded-xl bg-surface border border-border hover:border-gold-500/20 transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-white">
                                                            {booking.customerName}
                                                        </span>
                                                        <StatusBadge status={booking.status} size="sm" />
                                                    </div>
                                                    <p className="text-xs text-gold-400 mb-2">
                                                        {booking.eventType}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-muted">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {booking.startTime || "TBD"}
                                                        </span>
                                                        {booking.guestCount && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {booking.guestCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {booking.hall && (
                                                        <p className="text-xs text-muted mt-1">
                                                            Hall: {booking.hall.name}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
