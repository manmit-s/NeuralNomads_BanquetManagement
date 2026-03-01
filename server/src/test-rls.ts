import { createClient } from "@supabase/supabase-js";
import { config } from './config/index.js';

async function testRLS() {
    console.log('--- Testing RLS with Service Role Key ---');
    console.log('Service Role Key (first 50 chars):', config.supabase.serviceRoleKey.substring(0, 50));

    // Create admin client explicitly with service role
    const admin = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log('\n1. Testing SELECT on users table...');
    const { data: selectData, error: selectError } = await admin
        .from('users')
        .select('*')
        .limit(3);

    if (selectError) {
        console.error('❌ SELECT Error:', JSON.stringify(selectError, null, 2));
    } else {
        console.log('✅ SELECT Success! Users found:', selectData?.length);
        if (selectData && selectData.length > 0) {
            console.log('   First user:', JSON.stringify(selectData[0], null, 2));
        }
    }

    console.log('\n2. Testing INSERT on users table...');
    const testId = crypto.randomUUID();
    const { data: insertData, error: insertError } = await admin
        .from('users')
        .insert({
            id: testId,
            authId: crypto.randomUUID(),
            email: `rls-test-${Date.now()}@example.com`,
            name: 'RLS Test User',
            phone: null,
            role: 'OWNER',
            branchId: null,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

    if (insertError) {
        console.error('❌ INSERT Error:', JSON.stringify(insertError, null, 2));
    } else {
        console.log('✅ INSERT Success! User created:', insertData?.id);
    }

    // Cleanup test user
    if (insertData) {
        await admin.from('users').delete().eq('id', testId);
        console.log('🧹 Cleaned up test user');
    }
}

testRLS();
