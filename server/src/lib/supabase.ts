import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";

const supabaseUrl = config.supabase.url || "https://dummy.supabase.co";
const supabaseAnonKey = config.supabase.anonKey || "dummy-anon-key";
const supabaseServiceKey = config.supabase.serviceRoleKey || "dummy-service-role-key";

// Public client — used for verifying user tokens
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — used for managing users (sign-up, role changes)
export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
);
