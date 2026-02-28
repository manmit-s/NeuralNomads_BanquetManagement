/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "#0B0B0F",
                surface: "#111115",
                card: "#17171C",
                "card-hover": "#1E1E24",
                border: "#222228",
                "border-light": "#2A2A32",
                gold: {
                    50: "#FFF9E6",
                    100: "#FFF0BF",
                    200: "#FFE699",
                    300: "#FFD966",
                    400: "#DFBC3E",
                    500: "#D4AF37",
                    600: "#B8962E",
                    700: "#997D26",
                    800: "#7A641E",
                    900: "#5C4B16",
                },
                success: {
                    DEFAULT: "#22C55E",
                    muted: "#22C55E20",
                },
                danger: {
                    DEFAULT: "#EF4444",
                    muted: "#EF444420",
                },
                warning: {
                    DEFAULT: "#F59E0B",
                    muted: "#F59E0B20",
                },
                muted: "#A1A1AA",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Playfair Display", "Georgia", "serif"],
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
            },
            boxShadow: {
                glow: "0 0 20px rgba(212, 175, 55, 0.15)",
                "glow-sm": "0 0 10px rgba(212, 175, 55, 0.1)",
                "card": "0 4px 24px rgba(0, 0, 0, 0.25)",
                "card-hover": "0 8px 32px rgba(0, 0, 0, 0.35)",
            },
            backgroundImage: {
                "gold-gradient": "linear-gradient(135deg, #D4AF37, #F5D77A, #D4AF37)",
                "gold-gradient-subtle": "linear-gradient(135deg, #D4AF3710, #F5D77A10)",
                "glass": "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05))",
            },
            animation: {
                "shimmer": "shimmer 2s linear infinite",
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
};
