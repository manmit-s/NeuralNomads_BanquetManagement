import { supabaseAdmin } from './lib/supabase.js';

async function testBookingCreation() {
    console.log('--- Testing Booking Creation via REST ---');
    try {
        // 1. Get user
        const { data: users, error: userErr } = await supabaseAdmin.from('users').select('id, branchId').limit(1);
        if (userErr || !users?.length) { console.error('No users found', userErr); return; }
        const user = users[0];

        // 2. Get/Create branch
        let branchId = user.branchId;
        if (!branchId) {
            const { data: b } = await supabaseAdmin.from('branches').select('id').limit(1);
            if (b?.length) branchId = b[0].id;
        }

        // 3. Get/Create hall
        let hallId;
        const { data: halls } = await supabaseAdmin.from('halls').select('id').eq('branchId', branchId).limit(1);
        if (halls?.length) {
            hallId = halls[0].id;
        } else {
            const { data: h } = await supabaseAdmin.from('halls').insert({
                id: crypto.randomUUID(),
                name: 'Test Hall',
                capacity: 100,
                pricePerEvent: 5000,
                branchId: branchId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).select().single();
            hallId = h!.id;
        }

        // 4. Get/Create lead
        let leadId;
        const { data: leads } = await supabaseAdmin.from('leads').select('id').eq('branchId', branchId).limit(1);
        if (leads?.length) {
            leadId = leads[0].id;
        } else {
            const { data: l } = await supabaseAdmin.from('leads').insert({
                id: crypto.randomUUID(),
                customerName: 'Booking Test Lead',
                customerPhone: '1122334455',
                eventType: 'Meeting',
                status: 'CALL',
                branchId: branchId,
                assignedToId: user.id,
                createdById: user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).select().single();
            leadId = l!.id;
        }

        console.log(`Using: Branch=${branchId}, Hall=${hallId}, Lead=${leadId}`);

        // 5. Create Booking
        const signinRes = await fetch('http://localhost:5000/api/v1/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: '61vedant.nikumbh@gmail.jghjk', password: 'trgfhunbhjn' })
        });
        const signinData = await signinRes.json() as any;

        const bookingReq = await fetch('http://localhost:5000/api/v1/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${signinData.data.session.accessToken}`
            },
            body: JSON.stringify({
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString(),
                startTime: '10:00',
                endTime: '18:00',
                guestCount: 50,
                hallId,
                leadId,
                branchId: "",
                totalAmount: 5000,
                advanceAmount: 1000
            })
        });

        const bookingRes = await bookingReq.json() as any;
        console.log('Booking Creation Response:', bookingReq.status, JSON.stringify(bookingRes, null, 2));
    } catch (e: any) {
        console.error('Test script error:', e.message);
    }
}

testBookingCreation();
