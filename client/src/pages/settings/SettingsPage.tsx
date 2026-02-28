import { useState } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Save,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

type Section = "profile" | "notifications" | "security" | "appearance";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [active, setActive] = useState<Section>("profile");

    return (
        <div>
            <PageHeader
                title="Settings"
                subtitle="Manage your account preferences"
                icon={Settings}
            />

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-60 flex-shrink-0">
                    <GlassCard>
                        <div className="p-3 space-y-1">
                            {SECTIONS.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setActive(s.id)}
                                    className={cn(
                                        "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        active === s.id
                                            ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                                            : "text-muted hover:text-white hover:bg-surface/80"
                                    )}
                                >
                                    <s.icon className="h-4 w-4" />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {active === "profile" && <ProfileSection user={user} />}
                        {active === "notifications" && <NotificationsSection />}
                        {active === "security" && <SecuritySection />}
                        {active === "appearance" && <AppearanceSection />}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function ProfileSection({ user }: { user: any }) {
    return (
        <GlassCard>
            <div className="p-6">
                <h3 className="text-sm font-semibold text-white mb-6">Profile Information</h3>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Full Name</label>
                        <input className="input-dark" defaultValue={user?.name || ""} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
                        <input className="input-dark" defaultValue={user?.email || ""} type="email" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Phone</label>
                        <input className="input-dark" defaultValue={user?.phone || ""} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Role</label>
                        <input className="input-dark opacity-50 cursor-not-allowed" value={user?.role || ""} readOnly />
                    </div>
                    <button
                        onClick={() => toast.success("Profile updated")}
                        className="btn-gold mt-2"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}

function NotificationsSection() {
    const [settings, setSettings] = useState({
        newBooking: true,
        paymentReceived: true,
        lowStock: true,
        leadFollowUp: false,
        dailySummary: true,
        emailAlerts: false,
    });

    const toggle = (key: keyof typeof settings) =>
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <GlassCard>
            <div className="p-6">
                <h3 className="text-sm font-semibold text-white mb-6">Notification Preferences</h3>
                <div className="space-y-4 max-w-md">
                    {Object.entries(settings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border">
                            <span className="text-sm text-white capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <button
                                onClick={() => toggle(key as keyof typeof settings)}
                                className={cn(
                                    "relative h-6 w-11 rounded-full transition-colors",
                                    value ? "bg-gold-500" : "bg-surface border border-border"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute top-0.5 h-5 w-5 rounded-full transition-all",
                                        value ? "left-[22px] bg-black" : "left-0.5 bg-muted"
                                    )}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}

function SecuritySection() {
    return (
        <GlassCard>
            <div className="p-6">
                <h3 className="text-sm font-semibold text-white mb-6">Change Password</h3>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Current Password</label>
                        <input className="input-dark" type="password" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">New Password</label>
                        <input className="input-dark" type="password" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Confirm New Password</label>
                        <input className="input-dark" type="password" />
                    </div>
                    <button
                        onClick={() => toast.success("Password updated")}
                        className="btn-gold mt-2"
                    >
                        <Shield className="h-4 w-4" />
                        Update Password
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}

function AppearanceSection() {
    return (
        <GlassCard>
            <div className="p-6">
                <h3 className="text-sm font-semibold text-white mb-6">Appearance</h3>
                <div className="space-y-4 max-w-md">
                    <div className="p-4 rounded-xl bg-surface/50 border border-gold-500/20">
                        <div className="flex items-center gap-3">
                            <Palette className="h-5 w-5 text-gold-400" />
                            <div>
                                <p className="text-sm font-medium text-white">Dark Luxury Theme</p>
                                <p className="text-xs text-muted">Active theme with gold accents</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-muted">
                        More themes coming soon. The dark luxury theme is optimized for extended use.
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}
