import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Search,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Star,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import api from "@/lib/api";

interface ReviewResult {
    branch: string;
    review_count: number;
    analysis: string;
    message?: string;
}

interface Branch {
    id: string;
    name: string;
}

export default function ReputationPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchName, setBranchName] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ReviewResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isDemo, setIsDemo] = useState(false);
    const isLoadingRef = useRef(false);
    const demoLoadedRef = useRef(false);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get("/branches");
                let dbBranches = res.data?.data || [];

                // Always ensure Main Branch, Delhi Branch, Pune Branch are in the list for Demo purposes
                const defaultNames = ["Main Branch", "Delhi Branch", "Pune Branch"];
                const missingNames = defaultNames.filter(name => !dbBranches.some((b: Branch) => b.name === name));
                const demoBranches = missingNames.map((name, i) => ({ id: `demo-${i}`, name }));
                const finalBranches = [...dbBranches, ...demoBranches];

                setBranches(finalBranches);
                setBranchName(finalBranches[0].name);
            } catch (err) {
                console.error("Failed to fetch branches:", err);
                const fallback = [
                    { id: "demo-0", name: "Main Branch" },
                    { id: "demo-1", name: "Delhi Branch" },
                    { id: "demo-2", name: "Pune Branch" }
                ];
                setBranches(fallback);
                setBranchName(fallback[0].name);
            }
        };
        fetchBranches();
    }, []);

    // Auto-load demo analysis on first visit
    useEffect(() => {
        if (demoLoadedRef.current) return;
        demoLoadedRef.current = true;
        loadDemoAnalysis();
    }, []);

    const loadDemoAnalysis = async () => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await api.get("/ai/reviews/demo");
            setResult(res.data);
            setIsDemo(true);
        } catch (err: any) {
            console.error("Demo load error:", err);
            // Silently fail — user can still use URL-based analysis
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    };

    const analyzeReputation = async () => {
        if (isLoadingRef.current) return;
        if (!branchName.trim()) return;

        isLoadingRef.current = true;
        setLoading(true);
        setErrorMsg(null);
        setResult(null);

        try {
            const res = await api.post("/ai/reviews", {
                branch_name: branchName.trim(),
                review_url: "",
            });

            setResult(res.data);
            setIsDemo(false);
        } catch (err: any) {
            console.error("Reputation analysis error:", err);
            const status = err?.response?.status;
            if (status === 500) {
                setErrorMsg("Review intelligence service temporarily unavailable. Please retry.");
            } else if (status === 400) {
                setErrorMsg(err?.response?.data?.message || "Invalid input.");
            } else {
                setErrorMsg("Failed to analyze reviews. Check URL and try again.");
            }
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    };

    // Parse risk level from analysis text
    const getRiskLevel = (analysis: string): "Low" | "Moderate" | "High" | "Unknown" => {
        if (/RISK_LEVEL:\s*High/i.test(analysis)) return "High";
        if (/RISK_LEVEL:\s*Moderate/i.test(analysis)) return "Moderate";
        if (/RISK_LEVEL:\s*Low/i.test(analysis)) return "Low";
        return "Unknown";
    };

    // Parse sentiment score from analysis text
    const getSentimentScore = (analysis: string): number | null => {
        const match = analysis.match(/SENTIMENT_SCORE:\s*(\d+)/i);
        return match ? parseInt(match[1]) : null;
    };

    const riskColors = {
        Low: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: CheckCircle2 },
        Moderate: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: AlertCircle },
        High: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: XCircle },
        Unknown: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20", icon: AlertCircle },
    };

    return (
        <div>
            <PageHeader
                title="Reputation Intelligence"
                subtitle="AI-powered review analysis & risk assessment"
                icon={Shield}
            />

            {/* Input Section */}
            <GlassCard className="mb-6">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <div>
                            <label className="block text-xs font-medium text-muted mb-2">Select Branch</label>
                            <select
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                                className="input-dark w-full appearance-none"
                            >
                                {branches.map((b) => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={analyzeReputation}
                                disabled={loading || !branchName.trim()}
                                className="btn-gold w-full disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        Analyze Reviews
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Error State */}
            {errorMsg && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="mb-6">
                        <div className="p-6 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400 leading-relaxed">{errorMsg}</p>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 gap-4"
                >
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gold-500/20 animate-ping" />
                        <div className="relative h-16 w-16 rounded-full bg-surface border border-gold-500/30 flex items-center justify-center">
                            <Shield className="h-7 w-7 text-gold-400 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-muted text-sm">Scraping reviews & running AI analysis...</p>
                    <p className="text-muted/50 text-xs">This may take 15-30 seconds</p>
                </motion.div>
            )}

            {/* Results */}
            {result && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                >
                    {/* Demo Indicator */}
                    {isDemo && (
                        <div className="bg-gold-500/5 border border-gold-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                            <Star className="h-4 w-4 text-gold-400" />
                            <p className="text-xs text-gold-400">
                                Showing demo analysis. Select a branch and click Analyze to process real-time reviews.
                            </p>
                        </div>
                    )}
                    {/* Top KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Branch */}
                        <GlassCard>
                            <div className="p-5">
                                <p className="text-xs text-muted mb-1">Branch Analyzed</p>
                                <p className="text-lg font-semibold text-white">{result.branch}</p>
                                <p className="text-xs text-muted mt-1">{result.review_count} reviews extracted</p>
                            </div>
                        </GlassCard>

                        {/* Sentiment Score */}
                        <GlassCard>
                            <div className="p-5">
                                <p className="text-xs text-muted mb-1">Sentiment Score</p>
                                {(() => {
                                    const score = getSentimentScore(result.analysis);
                                    const color = score !== null
                                        ? score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"
                                        : "text-gray-400";
                                    return (
                                        <div className="flex items-center gap-2">
                                            <p className={`text-3xl font-bold ${color}`}>
                                                {score !== null ? score : "—"}
                                            </p>
                                            <span className="text-xs text-muted">/100</span>
                                            {score !== null && score >= 50 ? (
                                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                                            ) : score !== null ? (
                                                <TrendingDown className="h-4 w-4 text-red-400" />
                                            ) : null}
                                        </div>
                                    );
                                })()}
                            </div>
                        </GlassCard>

                        {/* Risk Level */}
                        <GlassCard>
                            <div className="p-5">
                                <p className="text-xs text-muted mb-1">Risk Level</p>
                                {(() => {
                                    const risk = getRiskLevel(result.analysis);
                                    const style = riskColors[risk];
                                    const Icon = style.icon;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center`}>
                                                <Icon className={`h-5 w-5 ${style.text}`} />
                                            </div>
                                            <p className={`text-2xl font-bold ${style.text}`}>{risk}</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Full Analysis */}
                    <GlassCard>
                        <div className="p-5 border-b border-border">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Star className="h-4 w-4 text-gold-400" />
                                AI Reputation Analysis
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="bg-surface/50 rounded-xl border border-border/50 p-5">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                                    {result.analysis}
                                </pre>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Empty State */}
            {!result && !loading && !errorMsg && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-6">
                        <Shield className="h-9 w-9 text-gold-500/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Reputation Intelligence</h3>
                    <p className="text-sm text-muted max-w-md">
                        Select a branch to analyze its reputation. The AI will dynamically analyze real reviews from platforms like Zomato and Google Reviews, providing risk scoring and actionable insights.
                    </p>
                </div>
            )}
        </div>
    );
}
