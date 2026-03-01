import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

    supabase: {
        url: process.env.SUPABASE_URL!,
        anonKey: process.env.SUPABASE_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },

    jwt: {
        secret: process.env.JWT_SECRET!,
    },

    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || "",
        authToken: process.env.TWILIO_AUTH_TOKEN || "",
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
    },
} as const;
