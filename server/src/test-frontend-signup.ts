import { supabaseAdmin } from './lib/supabase.js';
import crypto from 'crypto';

async function testFrontendSignup() {
    console.log('--- Simulating Frontend Signup Insert ---');
    // Using a new email to avoid "User already exists" in Supabase Auth
    const mockFrontendData = {
        email: `test-${Date.now()}@example.com`,
        password: "password123",
        name: "Test Manager",
        role: "BRANCH_MANAGER",
        // branchId is explicitly missing, like the frontend
    };

    console.log('1. CreatingAuth User...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: mockFrontendData.email,
        password: mockFrontendData.password,
        email_confirm: true,
    });

    if (authError || !authData.user) {
        console.error("Auth Error:", authError);
        return;
    }

    console.log('2. Inserting into users table...');
    const { data: user, error: dbError } = await supabaseAdmin
        .from("users")
        .insert({
            id: crypto.randomUUID(),
            authId: authData.user.id,
            email: mockFrontendData.email,
            name: mockFrontendData.name,
            phone: null, // Frontend might not pass it
            role: mockFrontendData.role,
            branchId: mockFrontendData.role === "OWNER" ? null : undefined,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

    if (dbError) {
        console.error("❌ Full Database Error JSON:");
        console.error(JSON.stringify(dbError, null, 2));
    } else {
        console.log("✅ Insert successful:", user);
    }
}

testFrontendSignup();
