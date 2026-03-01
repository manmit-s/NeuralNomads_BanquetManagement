import { supabaseAdmin } from './lib/supabase.js';
import crypto from 'crypto';

async function testSignupInsert() {
    console.log('--- Testing Manual User Insert ---');
    const { data: user, error: dbError } = await supabaseAdmin
        .from("users")
        .insert({
            id: crypto.randomUUID(),
            authId: crypto.randomUUID(),
            email: "test.error.log@example.com",
            name: "Test Error Log",
            phone: "1234567890",
            role: "OWNER",
            branchId: null,
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

testSignupInsert();
