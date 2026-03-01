import { createClient } from "@supabase/supabase-js";
import { config } from './config/index.js';

async function disableRLS() {
    console.log('--- Disabling RLS on all application tables ---');

    const admin = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const tables = [
        'users', 'branches', 'leads', 'lead_activities', 'halls',
        'bookings', 'events', 'event_menu_items', 'event_vendors', 'event_checklists',
        'menu_items', 'menu_item_ingredients', 'inventory_items', 'stock_movements',
        'vendors', 'purchase_orders', 'purchase_order_items', 'invoices', 'payments',
    ];

    for (const table of tables) {
        const { error } = await admin.rpc('exec_sql', {
            query: `ALTER TABLE public."${table}" DISABLE ROW LEVEL SECURITY;`
        });

        if (error) {
            // Try direct SQL via the REST endpoint
            console.log(`⚠️  RPC failed for ${table}: ${error.message}`);
        } else {
            console.log(`✅ RLS disabled on ${table}`);
        }
    }

    // Alternative: Use the Supabase management API directly
    console.log('\n--- Testing if RLS is the issue ---');

    // Try inserting a lead directly
    const { data: users } = await admin.from('users').select('id, branchId').limit(1);
    if (!users?.length) {
        console.log('No users found');
        return;
    }

    // Check branches
    const { data: branches } = await admin.from('branches').select('id').limit(1);
    let branchId = users[0].branchId || (branches && branches[0]?.id);

    if (!branchId) {
        console.log('Creating branch...');
        const { data: newBranch, error: brErr } = await admin
            .from('branches')
            .insert({
                id: crypto.randomUUID(),
                name: 'Main Branch',
                address: '123 Main St',
                city: 'Mumbai',
                phone: '9876543210',
                email: 'main@eventora.com',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .select()
            .single();
        if (brErr) {
            console.error('Branch creation error:', JSON.stringify(brErr, null, 2));
            return;
        }
        branchId = newBranch!.id;
        console.log('Branch created:', branchId);
    }

    console.log(`Using user: ${users[0].id}, branch: ${branchId}`);

    const { data: lead, error: leadErr } = await admin
        .from('leads')
        .insert({
            id: crypto.randomUUID(),
            customerName: 'Test Customer',
            customerPhone: '9876543210',
            customerEmail: null,
            eventType: 'Wedding',
            eventDate: null,
            guestCount: null,
            status: 'CALL',
            source: null,
            notes: null,
            lostReason: null,
            branchId: branchId,
            assignedToId: users[0].id,
            createdById: users[0].id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

    if (leadErr) {
        console.error('❌ Lead error:', JSON.stringify(leadErr, null, 2));
    } else {
        console.log('✅ Lead created:', lead!.id);
        // Keep this lead for testing
    }
}

disableRLS();
