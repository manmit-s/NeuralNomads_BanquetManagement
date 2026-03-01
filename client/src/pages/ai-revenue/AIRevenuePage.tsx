import { useState, useRef, useEffect } from "react";
import {
    BrainCircuit,
    Send,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    AlertTriangle,
    Trophy,
    BarChart3,
    Loader2,
    Sparkles,
    PieChart,
    Building2,
    CheckCircle2
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { cn, formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

// ── Types ────────────────────────────────
interface BranchSummary {
    branch_name: string;
    revenue: number;
    revenue_share: number;
    occupancy: number;
    performance_score: number;
    is_weak: boolean;
    is_dominant: boolean;
    suggestion: string;
}

interface AIRevenueData {
    total_revenue: number;
    weak_branch: string;
    strong_branch: string;
    branch_summary: BranchSummary[];
    ai_response: string;
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444'];

// ── Main Page ────────────────────────────
export default function AIRevenuePage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<AIRevenueData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isLoadingRef = useRef(false);

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [showFullSummary, setShowFullSummary] = useState(false);

    const isOwner = user?.role === "OWNER";

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, isLoading]);

    const [cooldown, setCooldown] = useState(0);

    // Initial load removed - user must trigger manually

    // Cooldown timer effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const sendMessage = async (customMessage?: string, isInitialLoad = false) => {
        if (isLoading || isLoadingRef.current || cooldown > 0) return;

        const msg = customMessage || message;
        if (!msg.trim()) return;

        setErrorMsg(null);
        if (!isInitialLoad) {
            const userMsg: ChatMessage = { role: "user", content: msg };
            setChatHistory((prev) => [...prev, userMsg]);
            setMessage("");
        }

        console.log("AI CALL TRIGGERED");
        setIsLoading(true);
        isLoadingRef.current = true;

        try {
            const payload: any = {
                message: msg,
                chat_history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
            };

            const res = await api.post("/ai/revenue", payload);
            const result: AIRevenueData = res.data;
            setData(result);

            // Trim large AI output to 1500 chars
            const optimizedText = (result.ai_response || "").slice(0, 1500);

            setChatHistory((prev) => [
                ...prev,
                { role: "assistant", content: optimizedText },
            ]);
        } catch (err: any) {
            console.error("Frontend AI error:", err);
            const status = err?.response?.status;
            let errorMessage = "AI temporarily unavailable. Please retry.";

            if (status === 401) {
                errorMessage = "Session expired. Please sign in again to use AI features.";
                // Clear token and redirect to login
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                setTimeout(() => { window.location.href = "/login"; }, 2000);
            } else if (status === 429) {
                errorMessage = "AI is temporarily rate-limited. Please wait a few seconds.";
            } else if (status === 500) {
                errorMessage = "AI service unavailable — ensure the Python AI microservice is running on port 8000.";
            } else if (err?.response?.data?.error) {
                errorMessage = err.response.data.error;
            }

            setErrorMsg(errorMessage);

            if (!isInitialLoad) {
                setChatHistory((prev) => [
                    ...prev,
                    { role: "assistant", content: `⚠️ ${errorMessage}` },
                ]);
            }
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
            setCooldown(5); // 5-second cooldown
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ── Executive Dashboard Render ──
    const renderExecutiveDashboard = () => (
        <div className="grid grid-cols-5 gap-6 mb-6">
            <div className="col-span-3 space-y-6">
                {/* KPI Cards */}
                {data && (
                    <div className="grid grid-cols-3 gap-4">
                        <GlassCard>
                            <div className="flex items-center gap-3 p-4">
                                <div className="h-10 w-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                                    <IndianRupee className="h-5 w-5 text-gold-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Total Revenue</p>
                                    <p className="text-lg font-bold text-white">{formatCurrency(data.total_revenue)}</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="flex items-center gap-3 p-4">
                                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <TrendingDown className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Weakest Branch</p>
                                    <p className="text-lg font-bold text-red-400 line-clamp-1">{data.weak_branch || "—"}</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="flex items-center gap-3 p-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Trophy className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Strongest Branch</p>
                                    <p className="text-lg font-bold text-emerald-400 line-clamp-1">{data.strong_branch || "—"}</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Charts */}
                {data && data.branch_summary.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Revenue by Branch */}
                        <GlassCard>
                            <div className="p-5 border-b border-border">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-gold-400" />
                                    Revenue per Branch
                                </h3>
                            </div>
                            <div className="p-4 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.branch_summary}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                                        <XAxis dataKey="branch_name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#666" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                            {data.branch_summary.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Revenue Share Pie & Occupancy */}
                        <GlassCard>
                            <div className="p-5 border-b border-border">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <PieChart className="h-4 w-4 text-gold-400" />
                                    Revenue Share & Occupancy
                                </h3>
                            </div>
                            <div className="p-4 h-[250px] flex flex-col items-center">
                                <div className="h-[150px] w-full mb-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={data.branch_summary}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={65}
                                                paddingAngle={5}
                                                dataKey="revenue"
                                            >
                                                {data.branch_summary.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full space-y-2">
                                    {data.branch_summary.slice(0, 2).map((b, i) => (
                                        <div key={b.branch_name} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                <span className="text-muted truncate max-w-[80px]">{b.branch_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-white font-medium">{b.revenue_share.toFixed(1)}%</span>
                                                <span className={cn(
                                                    "w-12 text-right font-medium",
                                                    b.occupancy > 80 ? 'text-emerald-400' : 'text-gold-400'
                                                )}>{b.occupancy.toFixed(0)}% occ</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {data && data.branch_summary.length === 0 && (
                    <GlassCard>
                        <div className="p-10 text-center flex flex-col items-center justify-center text-muted">
                            <AlertTriangle className="h-8 w-8 mb-3 opacity-50" />
                            <p>No active bookings found across branches.</p>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* AI Summary Sidebar (Collapsible) */}
            <div className="col-span-2 space-y-4">
                <GlassCard className="h-full">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-gold-400" />
                            AI Summary
                        </h3>
                        {data && (
                            <button
                                onClick={() => setShowFullSummary(!showFullSummary)}
                                className="text-[10px] text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-md hover:bg-gold-500/10 transition-colors"
                            >
                                {showFullSummary ? "Collapse" : "Show Details"}
                            </button>
                        )}
                    </div>
                    <div className="p-5 space-y-6 overflow-y-auto" style={{ maxHeight: "400px" }}>
                        {data?.branch_summary.map((branch, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">{branch.branch_name}</span>
                                    {branch.is_weak && <span className="bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Needs Attention</span>}
                                    {branch.is_dominant && <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Top Performer</span>}
                                </div>
                                {showFullSummary && (
                                    <div className="bg-surface/50 p-3 rounded-lg border border-border/50 text-xs leading-relaxed text-gray-300">
                                        {branch.suggestion}
                                    </div>
                                )}
                            </div>
                        ))}

                        {(!data || isLoading) && !chatHistory.length && (
                            <div className="flex flex-col items-center justify-center p-8 text-muted text-sm gap-4">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-gold-400" />
                                        <span>Analyzing strategy...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-8 w-8 text-gold-500/50 mb-2" />
                                        <p className="text-center">Ready to assess branch performance and build strategies.</p>
                                        <button
                                            onClick={() => sendMessage("Analyze current performance and provide strategic suggestions.", true)}
                                            disabled={isLoading || cooldown > 0}
                                            className="px-4 py-2 mt-2 rounded-lg bg-gold-gradient text-black font-medium text-xs hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            Analyze Strategy
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {errorMsg && !data && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400 leading-relaxed">{errorMsg}</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );

    // ── Branch Dashboard Render ──
    const renderBranchDashboard = () => (
        <div className="grid grid-cols-5 gap-6 mb-6">
            <div className="col-span-3 space-y-6">
                {/* Branch KPI Cards */}
                {data && data.branch_summary.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        <GlassCard>
                            <div className="flex items-center gap-3 p-4">
                                <div className="h-10 w-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                                    <IndianRupee className="h-5 w-5 text-gold-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Branch Revenue</p>
                                    <p className="text-lg font-bold text-white">{formatCurrency(data.branch_summary[0]?.revenue || 0)}</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="flex items-center gap-3 p-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Occupancy %</p>
                                    <p className="text-lg font-bold text-white">{(data.branch_summary[0]?.occupancy || 0).toFixed(1)}%</p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <div className="flex items-center gap-3 p-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Health Score</p>
                                    <p className="text-lg font-bold text-emerald-400">{(data.branch_summary[0]?.performance_score || 0).toFixed(1)}/10</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Branch simple trend - Mocking a line based on total revenue points for visuals */}
                {data && data.branch_summary.length > 0 && (
                    <GlassCard>
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-gold-400" />
                                Revenue Overview
                            </h3>
                            <span className="text-xs text-muted bg-surface/50 px-2 py-1 rounded-md border border-border">Current Status</span>
                        </div>
                        <div className="p-5 bg-surface/30 rounded-lg m-4 border border-border/50 text-sm leading-relaxed text-gray-300">
                            {data.branch_summary[0]?.suggestion || "Operating normally."}
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* AI Action items */}
            <div className="col-span-2 space-y-4">
                <GlassCard className="h-full">
                    <div className="p-5 border-b border-border flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-gold-400" />
                            Branch Optimization Steps
                        </h3>
                    </div>
                    <div className="p-5 space-y-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                        {!data && !errorMsg ? (
                            <div className="flex flex-col items-center justify-center text-muted gap-4">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin text-gold-400" />
                                        <span className="text-sm">Assessing branch health...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm mb-2">Ready to assess branch.</span>
                                        <button
                                            onClick={() => sendMessage("Analyze current performance and provide strategic suggestions.", true)}
                                            disabled={isLoading || cooldown > 0}
                                            className="px-4 py-2 rounded-lg bg-gold-gradient text-black font-medium text-xs hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            Analyze AI Health
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : errorMsg ? (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 w-full">
                                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400 leading-relaxed text-left">{errorMsg}</p>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-300 w-full text-left space-y-3">
                                <p className="font-medium text-white mb-2">Automated Directives:</p>
                                <ul className="space-y-2 list-disc pl-5">
                                    <li>Focus on increasing off-peak bookings</li>
                                    <li>Optimize package pricing upsales</li>
                                    <li>Review incoming leads pipeline daily</li>
                                </ul>
                                <p className="text-xs text-muted mt-4 italic">Use the Revenue Copilot chat below for deeper operational and marketing guidance.</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );

    return (
        <div className="pb-8">
            <PageHeader
                title={isOwner ? "Executive Revenue Hub" : "Branch Revenue Copilot"}
                subtitle={isOwner
                    ? "Portfolio-wide AI intelligence and strategy"
                    : "Automated insights to maximize your branch's performance"}
                icon={BrainCircuit}
                action={
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
                            AI Sync {isLoading ? "Active" : "Stable"}
                        </div>
                    </div>
                }
            />

            {/* Dashboards View */}
            {isOwner ? renderExecutiveDashboard() : renderBranchDashboard()}

            {/* ── Standardized Chat UI at Bottom ── */}
            <GlassCard padding={false} className="flex flex-col flex-1 min-h-[400px]">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between gap-3 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gold-gradient shadow-glow-sm flex items-center justify-center">
                            <BrainCircuit className="h-4 w-4 text-black" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Revenue Copilot Chat</h3>
                            <p className="text-[10px] text-muted">Powered by AI Engine</p>
                        </div>
                    </div>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-background/30 backdrop-blur-sm max-h-[500px] min-h-[300px]">
                    {chatHistory.length === 0 && !isLoading && !errorMsg && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10">
                            <div className="h-12 w-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-2">
                                <Sparkles className="h-6 w-6 text-gold-400" />
                            </div>
                            <h3 className="text-sm font-medium text-white">Ask your Revenue Copilot</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => sendMessage("What are our weakest areas regarding revenue?")}
                                    className="px-3 py-1.5 text-xs rounded-full bg-surface border border-border hover:border-gold-500/40 text-muted transition-colors"
                                >
                                    Identify weaknesses
                                </button>
                                <button
                                    onClick={() => sendMessage("Generate a marketing strategy to improve occupancy.")}
                                    className="px-3 py-1.5 text-xs rounded-full bg-surface border border-border hover:border-gold-500/40 text-muted transition-colors"
                                >
                                    Marketing strategy
                                </button>
                            </div>
                        </div>
                    )}

                    {chatHistory.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm",
                                    msg.role === "user"
                                        ? "bg-gold-500/10 text-gold-100 border border-gold-500/20 rounded-br-none"
                                        : "bg-surface border border-border text-gray-200 rounded-bl-none"
                                )}
                            >
                                <div className={cn(
                                    "whitespace-pre-wrap",
                                    msg.content.startsWith("⚠️") && "text-red-400 font-medium"
                                )}>{msg.content}</div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-surface border border-border rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center gap-3 text-sm text-muted shadow-sm">
                                <span className="flex gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </span>
                                <span>Generating insights…</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-surface/[0.02]">
                    <div className="flex gap-3">
                        <input
                            id="revenue-chat-input"
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={cooldown > 0 ? `Please wait ${cooldown}s...` : "Ask about seasonal strategy, upselling operations, or risk alerts…"}
                            disabled={isLoading || cooldown > 0}
                            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted/50 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 transition-all shadow-inner disabled:opacity-50"
                        />
                        <button
                            id="revenue-chat-send"
                            onClick={() => sendMessage()}
                            disabled={isLoading || cooldown > 0 || !message.trim()}
                            className={cn(
                                "px-5 py-3 rounded-xl transition-all flex items-center gap-2",
                                message.trim() && !isLoading && cooldown === 0
                                    ? "bg-gold-gradient text-black font-medium shadow-glow-sm hover:shadow-glow hover:scale-105"
                                    : "bg-surface text-muted border border-border cursor-not-allowed"
                            )}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
