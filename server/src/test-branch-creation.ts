import { supabaseAdmin } from './lib/supabase.js';
import crypto from 'crypto';

async function testBranch() {
    try {
        console.log("UUID Test (Node Global):", global.crypto?.randomUUID ? global.crypto.randomUUID() : 'undefined');
        console.log("UUID Test (crypto module):", crypto.randomUUID());

        const { data: newBranch, error: brErr } = await supabaseAdmin
            .from("branches")
            .insert({
                id: crypto.randomUUID(),
                name: "Main Branch",
                address: "Default Address",
                city: "Default City",
                phone: "0000000000",
                email: "branch@eventora.com",
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .select()
            .single();

        if (brErr) {
            console.error("Failed to create default branch (logged to branch-error.html)");
            require('fs').writeFileSync('branch-error.html', typeof brErr === 'string' ? brErr : JSON.stringify(brErr, null, 2));
        } else {
            console.log("Branch created successfully:", newBranch.id);
            // Don't delete it so we have a valid branch for the user
        }
    } catch (err: any) {
        console.error("Exception in testBranch:", err.message);
    }
}

testBranch();
