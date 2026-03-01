import { supabaseAdmin } from './lib/supabase.js';

async function testLeadColumns() {
    console.log('--- Testing Lead Table Columns ---');

    // 1. Get an existing user
    const { data: users } = await supabaseAdmin.from('users').select('id, branchId').limit(1);
    if (!users?.length) { console.log('No users'); return; }
    const user = users[0];
    console.log('User:', user.id, 'branchId:', user.branchId);

    // 2. Check branches
    const { data: branches } = await supabaseAdmin.from('branches').select('id, name').limit(3);
    console.log('Branches:', JSON.stringify(branches));

    // If no branches, we need to create one first
    let branchId = user.branchId || (branches && branches[0]?.id);
    if (!branchId) {
        console.log('No branches found! Creating one...');
        const { data: newBranch, error: brErr } = await supabaseAdmin
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
            console.error('❌ Failed to create branch:', JSON.stringify(brErr, null, 2));
            return;
        }
        branchId = newBranch.id;
        console.log('✅ Created branch:', branchId);
    }

    // 3. Try inserting lead with ALL fields explicitly set (including optional ones as null)
    console.log('\nInserting lead with branchId:', branchId);
    const { data: lead, error } = await supabaseAdmin
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
            assignedToId: user.id,
            createdById: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Lead insert error:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Lead created:', lead.id);
        // Cleanup
        await supabaseAdmin.from('leads').delete().eq('id', lead.id);
        console.log('🧹 Cleaned up');
    }
}

testLeadColumns();
