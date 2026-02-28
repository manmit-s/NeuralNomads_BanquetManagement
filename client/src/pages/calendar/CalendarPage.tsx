import PageHeader from "../../components/ui/PageHeader";

export default function CalendarPage() {
    return (
        <div>
            <PageHeader title="Calendar" subtitle="View hall availability and scheduled events" />
            <div className="card">
                <p className="text-gray-500 text-sm">
                    Calendar view with real-time availability will render here.
                    Integrate with a library like <code>@fullcalendar/react</code> or a custom grid.
                </p>
                <div className="mt-6 grid grid-cols-7 gap-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => (
                        <div key={i} className="aspect-square rounded-lg border border-gray-100 p-1 text-xs text-gray-400 hover:bg-primary-50 cursor-pointer">
                            {((i % 31) + 1)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
