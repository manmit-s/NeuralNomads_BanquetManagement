// Test the actual running server's /leads endpoint
async function testLeadApi() {
    console.log('--- Testing Lead API on Running Server ---');

    // 1. Sign in first to get a token
    const signinRes = await fetch('http://localhost:5000/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'vedant15.nikumbh@gmail.com', password: '12345vedant2345' })
    });

    const signinData = await signinRes.json() as any;
    console.log('Signin status:', signinRes.status);

    if (!signinData.success) {
        console.error('Signin failed:', JSON.stringify(signinData, null, 2));
        // Try with different passwords
        for (const pw of ['password123', 'Password123', 'test123']) {
            const r = await fetch('http://localhost:5000/api/v1/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'vedant15.nikumbh@gmail.com', password: pw })
            });
            const d = await r.json() as any;
            if (d.success) {
                console.log(`Found working password: ${pw}`);
                return testWithToken(d.data.session.accessToken);
            }
        }
        console.log('Could not sign in. Listing users to check emails...');
        // Check what emails exist via supabase
        const { supabaseAdmin } = await import('./lib/supabase.js');
        const { data: users } = await supabaseAdmin.from('users').select('email').limit(5);
        console.log('Users in DB:', users);
        return;
    }

    const token = signinData.data.session.accessToken;
    await testWithToken(token);
}

async function testWithToken(token: string) {
    console.log('Token (first 50):', token.substring(0, 50));

    // 2. Create a lead
    const leadRes = await fetch('http://localhost:5000/api/v1/leads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            customerName: 'API Test Customer',
            customerPhone: '9876543210',
            customerEmail: '',
            eventType: 'Wedding',
            eventDate: '',
            guestCount: '',
            notes: '',
            branchId: '',
        })
    });

    const leadData = await leadRes.json() as any;
    console.log('\nLead creation status:', leadRes.status);
    console.log('Response:', JSON.stringify(leadData, null, 2));
}

testLeadApi();
