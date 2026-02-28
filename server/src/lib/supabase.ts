import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";

// Public client — used for verifying user tokens
export const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Admin client — used for managing users (sign-up, role changes)
export const supabaseAdmin = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
);
