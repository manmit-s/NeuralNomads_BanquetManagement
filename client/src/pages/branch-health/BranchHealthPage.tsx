import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
    Activity,
    Loader2,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Sparkles,
    BarChart3,
    Target,
    Zap,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

interface BranchData {
    branch_name: string;
    economic_score: number;
    social_score: number;
    health_index: number;
    status: string;
}

interface HealthReport {
    overall_health_score: number;
    strongest_branch: string;
    weakest_branch: string;
    branches: BranchData[];
    ai_executive_summary: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Strong: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    Stable: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    "At Risk": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    Critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

const CHART_COLORS = ["#D4AF37", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function BranchHealthPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<HealthReport | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);
    const isLoadingRef = useRef(false);

    const isOwner = user?.role === "OWNER";

    const analyzeHealth = async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await api.post("/ai/branch-health", {
                // Backend fetches real branch data from DB automatically
                review_overrides: {}
            });

            setReport(res.data);
        } catch (err: any) {
            console.error("Health analysis error:", err);
            setErrorMsg(err?.response?.data?.message || "Failed to generate health report.");
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        if (score >= 40) return "text-orange-400";
        return "text-red-400";
    };

    const getHealthIcon = (score: number) => {
        if (score >= 80) return CheckCircle2;
        if (score >= 60) return AlertCircle;
        return XCircle;
    };

    // Filter branches for branch manager view
    const filteredBranches = report?.branches
        ? isOwner
            ? report.branches
            : report.branches.filter(b =>
                b.branch_name.toLowerCase().includes((user?.branch?.name || "").toLowerCase())
            )
        : [];

    // Prepare chart data
    const barChartData = filteredBranches.map(b => ({
        name: b.branch_name,
        Economic: b.economic_score,
        Social: b.social_score,
    }));

    const radarData = filteredBranches.map(b => ({
        branch: b.branch_name,
        economic: b.economic_score,
        social: b.social_score,
        health: b.health_index,
    }));

    return (
        <div>
            <PageHeader
                title="Branch Performance Intelligence"
                subtitle="Combined economic & social health analysis"
                icon={Activity}
                action={
                    <button
                        onClick={analyzeHealth}
                        disabled={loading}
                        className="btn-gold disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Zap className="h-4 w-4" />
                                Analyze Branch Health
                            </>
                        )}
                    </button>
                }
            />

            {/* Error */}
            {errorMsg && (
                <GlassCard className="mb-6">
                    <div className="p-5 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                        <p className="text-sm text-red-400">{errorMsg}</p>
                    </div>
                </GlassCard>
            )}

            {/* Loading */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 gap-4"
                >
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gold-500/20 animate-ping" />
                        <div className="relative h-16 w-16 rounded-full bg-surface border border-gold-500/30 flex items-center justify-center">
                            <Activity className="h-7 w-7 text-gold-400 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-muted text-sm">Computing branch health indices...</p>
                    <p className="text-muted/50 text-xs">Analyzing economic & social performance</p>
                </motion.div>
            )}

            {/* Results */}
            {report && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Overall Health */}
                        <GlassCard>
                            <div className="p-5">
                                <p className="text-xs text-muted mb-1">Overall Health</p>
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const Icon = getHealthIcon(report.overall_health_score);
                                        return <Icon className={`h-6 w-6 ${getHealthColor(report.overall_health_score)}`} />;
                                    })()}
                                    <span className={`text-3xl font-bold ${getHealthColor(report.overall_health_score)}`}>
                                        {report.overall_health_score}
                                    </span>
                                    <span className="text-xs text-muted">/100</span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Strongest */}
                        <GlassCard>
                            <div className="p-5">
                                <p className="text-xs text-muted mb-1">Strongest Branch</p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                                    <span className="text-lg font-semibold text-emerald-400">{report.strongest_branch}</span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Weakest */}
                        <GlassCard>
                            <div className="p-5">
                                <p className="text-xs text-muted mb-1">Needs Attention</p>
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5 text-red-400" />
                                    <span className="text-lg font-semibold text-red-400">{report.weakest_branch}</span>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Branches Count */}
                        <GlassCard>
                            <div className="p-5">
                                <p className="text-xs text-muted mb-1">Branches Analyzed</p>
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-gold-400" />
                                    <span className="text-3xl font-bold text-white">{report.branches.length}</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Branch Comparison Table */}
                    <GlassCard>
                        <div className="p-5 border-b border-border">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-gold-400" />
                                Branch Comparison
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wider">Branch</th>
                                        <th className="text-center p-4 text-xs text-muted font-medium uppercase tracking-wider">Economic</th>
                                        <th className="text-center p-4 text-xs text-muted font-medium uppercase tracking-wider">Social</th>
                                        <th className="text-center p-4 text-xs text-muted font-medium uppercase tracking-wider">Health Index</th>
                                        <th className="text-center p-4 text-xs text-muted font-medium uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBranches.map((branch, idx) => {
                                        const style = STATUS_COLORS[branch.status] || STATUS_COLORS["Critical"];
                                        return (
                                            <motion.tr
                                                key={branch.branch_name}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border-b border-border/30 hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="p-4 font-medium text-white">{branch.branch_name}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-semibold ${getHealthColor(branch.economic_score)}`}>
                                                        {branch.economic_score}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-semibold ${getHealthColor(branch.social_score)}`}>
                                                        {branch.social_score}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-lg font-bold ${getHealthColor(branch.health_index)}`}>
                                                        {branch.health_index}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`${style.bg} ${style.text} border ${style.border} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                                                        {branch.status}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar Chart: Economic vs Social */}
                        <GlassCard>
                            <div className="p-5 border-b border-border">
                                <h3 className="text-sm font-semibold text-white">Economic vs Social Scores</h3>
                            </div>
                            <div className="p-5" style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222228" />
                                        <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#17171C",
                                                border: "1px solid #222228",
                                                borderRadius: "12px",
                                                color: "#fff",
                                                fontSize: 12,
                                            }}
                                        />
                                        <Bar dataKey="Economic" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="Social" fill="#22C55E" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Radar Chart */}
                        <GlassCard>
                            <div className="p-5 border-b border-border">
                                <h3 className="text-sm font-semibold text-white">Multi-Factor Comparison</h3>
                            </div>
                            <div className="p-5" style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#222228" />
                                        <PolarAngleAxis dataKey="branch" tick={{ fill: "#6B7280", fontSize: 11 }} />
                                        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#555", fontSize: 10 }} />
                                        <Radar name="Economic" dataKey="economic" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} />
                                        <Radar name="Social" dataKey="social" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} />
                                        <Radar name="Health" dataKey="health" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#17171C",
                                                border: "1px solid #222228",
                                                borderRadius: "12px",
                                                color: "#fff",
                                                fontSize: 12,
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>

                    {/* AI Executive Summary */}
                    <GlassCard>
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-gold-400" />
                                AI Executive Intelligence Summary
                            </h3>
                            <button
                                onClick={() => setShowSummary(!showSummary)}
                                className="text-[10px] text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-md hover:bg-gold-500/10 transition-colors"
                            >
                                {showSummary ? "Collapse" : "Expand"}
                            </button>
                        </div>
                        {showSummary && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="p-6"
                            >
                                <div className="bg-surface/50 rounded-xl border border-border/50 p-5">
                                    <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                                        {report.ai_executive_summary}
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </GlassCard>
                </motion.div>
            )}

            {/* Empty State */}
            {!report && !loading && !errorMsg && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-6">
                        <Activity className="h-9 w-9 text-gold-500/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Branch Performance Intelligence</h3>
                    <p className="text-sm text-muted max-w-md mb-6">
                        Combine economic revenue data with social reputation metrics to calculate a
                        unified Branch Health Index. Get AI-powered strategic insights across all branches.
                    </p>
                    <button
                        onClick={analyzeHealth}
                        className="btn-gold"
                    >
                        <Zap className="h-4 w-4" />
                        Generate Health Report
                    </button>
                </div>
            )}
        </div>
    );
}
