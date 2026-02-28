import { cn } from "@/lib/utils";

interface DataTableProps<T> {
    columns: {
        key: string;
        label: string;
        className?: string;
        render?: (item: T) => React.ReactNode;
    }[];
    data: T[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    onRowClick,
    emptyMessage = "No data found",
}: DataTableProps<T>) {
    return (
        <div className="glass-card overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        "px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider",
                                        col.className
                                    )}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-5 py-12 text-center text-sm text-muted"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, i) => (
                                <tr
                                    key={i}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "transition-colors",
                                        onRowClick && "cursor-pointer hover:bg-white/[0.02]"
                                    )}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={cn("px-5 py-4 text-sm", col.className)}
                                        >
                                            {col.render
                                                ? col.render(item)
                                                : (item[col.key] as React.ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
