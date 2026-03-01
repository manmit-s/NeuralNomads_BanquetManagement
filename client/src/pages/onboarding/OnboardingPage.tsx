import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    ArrowRight,
    ArrowLeft,
    Check,
    Plus,
    Trash2,
    Sparkles,
    Loader2,
    Users,
    DoorOpen,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

/* ────────────────── types ────────────────── */

interface BranchForm {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
}

interface HallForm {
    name: string;
    capacity: string;
    pricePerEvent: string;
    amenities: string;
}

const emptyBranch: BranchForm = { name: "", address: "", city: "", phone: "", email: "" };
const emptyHall: HallForm = { name: "", capacity: "", pricePerEvent: "", amenities: "" };

/* ────────────────── component ────────────── */

export default function OnboardingPage() {
    const navigate = useNavigate();

    /* wizard step */
    const [step, setStep] = useState(0); // 0 = branch, 1 = halls, 2 = done

    /* branch form */
    const [branch, setBranch] = useState<BranchForm>(emptyBranch);
    const [branchId, setBranchId] = useState<string | null>(null);

    /* halls form (multiple) */
    const [halls, setHalls] = useState<HallForm[]>([{ ...emptyHall }]);

    const [loading, setLoading] = useState(false);

    /* ──── branch helpers ──── */
    const updateBranch = (field: keyof BranchForm, value: string) =>
        setBranch((b) => ({ ...b, [field]: value }));

    const branchValid =
        branch.name.length >= 2 &&
        branch.address.length >= 5 &&
        branch.city.length >= 2 &&
        branch.phone.length >= 10 &&
        branch.email.includes("@");

    /* ──── hall helpers ──── */
    const updateHall = (idx: number, field: keyof HallForm, value: string) =>
        setHalls((prev) => prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h)));

    const addHall = () => setHalls((prev) => [...prev, { ...emptyHall }]);
    const removeHall = (idx: number) => setHalls((prev) => prev.filter((_, i) => i !== idx));

    const hallValid = (h: HallForm) =>
        h.name.length >= 2 && Number(h.capacity) > 0 && Number(h.pricePerEvent) > 0;

    const allHallsValid = halls.every(hallValid);

    /* ──── submit branch ──── */
    const submitBranch = async () => {
        setLoading(true);
        try {
            const res = await api.post("/branches", branch);
            setBranchId(res.data.data.id);
            toast.success(`Branch "${branch.name}" created!`);
            setStep(1);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to create branch");
        } finally {
            setLoading(false);
        }
    };

    /* ──── submit halls ──── */
    const submitHalls = async () => {
        if (!branchId) return;
        setLoading(true);
        try {
            for (const h of halls) {
                await api.post("/halls", {
                    name: h.name,
                    capacity: Number(h.capacity),
                    pricePerEvent: Number(h.pricePerEvent),
                    amenities: h.amenities
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean),
                    branchId,
                });
            }
            toast.success(`${halls.length} hall(s) created!`);
            setStep(2);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to create hall");
        } finally {
            setLoading(false);
        }
    };

    /* ──── slide animation ──── */
    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
    };

    const [direction, setDirection] = useState(1);

    const goNext = () => {
        setDirection(1);
        if (step === 0) submitBranch();
        else if (step === 1) submitHalls();
    };

    const goBack = () => {
        setDirection(-1);
        setStep((s) => Math.max(0, s - 1));
    };

    /* ──── input classes ──── */
    const inputCls =
        "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition";
    const labelCls = "mb-1.5 block text-sm font-medium text-white/70";

    /* ──────────────────────────────────────────── */
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
            {/* bg glow */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[160px]" />

            <div className="relative z-10 w-full max-w-xl">
                {/* progress dots */}
                <div className="mb-8 flex items-center justify-center gap-3">
                    {["Branch", "Halls", "Done"].map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${i < step
                                        ? "bg-amber-400 text-black"
                                        : i === step
                                            ? "border-2 border-amber-400 text-amber-400"
                                            : "border border-white/20 text-white/40"
                                    }`}
                            >
                                {i < step ? <Check size={14} /> : i + 1}
                            </div>
                            <span
                                className={`hidden text-sm sm:inline ${i === step ? "font-semibold text-amber-400" : "text-white/40"}`}
                            >
                                {label}
                            </span>
                            {i < 2 && <div className="mx-1 h-px w-8 bg-white/10" />}
                        </div>
                    ))}
                </div>

                {/* card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl"
                >
                    <AnimatePresence mode="wait" custom={direction}>
                        {/* ──── STEP 0 : Branch ──── */}
                        {step === 0 && (
                            <motion.div
                                key="branch"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="p-8"
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                                        <Building2 className="text-amber-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Create your first branch</h2>
                                        <p className="text-sm text-white/50">
                                            Where is your banquet hall located?
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className={labelCls}>Branch Name</label>
                                        <div className="relative">
                                            <Building2
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                            />
                                            <input
                                                className={`${inputCls} pl-10`}
                                                placeholder="e.g. Mumbai Main Branch"
                                                value={branch.name}
                                                onChange={(e) => updateBranch("name", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Address</label>
                                        <div className="relative">
                                            <MapPin
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                            />
                                            <input
                                                className={`${inputCls} pl-10`}
                                                placeholder="123, Main Road, Andheri West"
                                                value={branch.address}
                                                onChange={(e) => updateBranch("address", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>City</label>
                                            <input
                                                className={inputCls}
                                                placeholder="Mumbai"
                                                value={branch.city}
                                                onChange={(e) => updateBranch("city", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Phone</label>
                                            <div className="relative">
                                                <Phone
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                                />
                                                <input
                                                    className={`${inputCls} pl-10`}
                                                    placeholder="+91 98765 43210"
                                                    value={branch.phone}
                                                    onChange={(e) => updateBranch("phone", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Email</label>
                                        <div className="relative">
                                            <Mail
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                            />
                                            <input
                                                className={`${inputCls} pl-10`}
                                                type="email"
                                                placeholder="mumbai@eventora.com"
                                                value={branch.email}
                                                onChange={(e) => updateBranch("email", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={goNext}
                                    disabled={!branchValid || loading}
                                    className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-semibold text-black transition hover:shadow-lg hover:shadow-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* ──── STEP 1 : Halls ──── */}
                        {step === 1 && (
                            <motion.div
                                key="halls"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="p-8"
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                                        <DoorOpen className="text-amber-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Add halls</h2>
                                        <p className="text-sm text-white/50">
                                            List the event halls in "{branch.name}"
                                        </p>
                                    </div>
                                </div>

                                <div className="max-h-[400px] space-y-5 overflow-y-auto pr-1">
                                    {halls.map((h, idx) => (
                                        <div
                                            key={idx}
                                            className="relative rounded-xl border border-white/10 bg-white/5 p-4"
                                        >
                                            {halls.length > 1 && (
                                                <button
                                                    onClick={() => removeHall(idx)}
                                                    className="absolute right-3 top-3 rounded-lg p-1 text-white/30 transition hover:bg-red-500/20 hover:text-red-400"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}

                                            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-400/70">
                                                Hall {idx + 1}
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className={labelCls}>Hall Name</label>
                                                    <input
                                                        className={inputCls}
                                                        placeholder="e.g. Grand Ballroom"
                                                        value={h.name}
                                                        onChange={(e) => updateHall(idx, "name", e.target.value)}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className={labelCls}>
                                                            <Users size={12} className="mr-1 inline" />
                                                            Capacity
                                                        </label>
                                                        <input
                                                            className={inputCls}
                                                            type="number"
                                                            placeholder="500"
                                                            value={h.capacity}
                                                            onChange={(e) =>
                                                                updateHall(idx, "capacity", e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>Price / Event (₹)</label>
                                                        <input
                                                            className={inputCls}
                                                            type="number"
                                                            placeholder="100000"
                                                            value={h.pricePerEvent}
                                                            onChange={(e) =>
                                                                updateHall(idx, "pricePerEvent", e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className={labelCls}>
                                                        Amenities{" "}
                                                        <span className="text-white/30">(comma-separated)</span>
                                                    </label>
                                                    <input
                                                        className={inputCls}
                                                        placeholder="AC, Stage, Parking, DJ"
                                                        value={h.amenities}
                                                        onChange={(e) =>
                                                            updateHall(idx, "amenities", e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={addHall}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 py-2 text-sm text-white/50 transition hover:border-amber-400/30 hover:text-amber-400"
                                >
                                    <Plus size={14} /> Add another hall
                                </button>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={goBack}
                                        className="flex items-center gap-1 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5"
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={goNext}
                                        disabled={!allHallsValid || loading}
                                        className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-semibold text-black transition hover:shadow-lg hover:shadow-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <>
                                                Finish Setup
                                                <Check size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ──── STEP 2 : Done ──── */}
                        {step === 2 && (
                            <motion.div
                                key="done"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center p-10 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-400/30"
                                >
                                    <Sparkles className="text-black" size={28} />
                                </motion.div>

                                <h2 className="mb-2 text-2xl font-bold text-white">You're all set!</h2>
                                <p className="mb-6 text-white/50">
                                    Your branch and halls are ready. Head to the dashboard to start managing events,
                                    or add team members to get your staff online.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate("/team")}
                                        className="flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5"
                                    >
                                        <Users size={16} /> Add Team Members
                                    </button>
                                    <button
                                        onClick={() => navigate("/")}
                                        className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-semibold text-black transition hover:shadow-lg hover:shadow-amber-400/20"
                                    >
                                        Go to Dashboard
                                        <ArrowRight
                                            size={16}
                                            className="transition group-hover:translate-x-1"
                                        />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
