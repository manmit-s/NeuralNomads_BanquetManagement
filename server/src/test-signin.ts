import { supabaseAdmin } from './lib/supabase.js';

async function testSignin() {
    // Use credentials that the user actually registered with
    // We'll get the email from the users table
    console.log('--- Testing Signin Flow ---');

    // 1. List all registered users
    const { data: users, error: listErr } = await supabaseAdmin
        .from('users')
        .select('id, authId, email, role, isActive')
        .limit(5);

    if (listErr) {
        console.error('❌ List users error:', listErr);
        return;
    }

    console.log('Registered users:', JSON.stringify(users, null, 2));

    if (!users || users.length === 0) {
        console.log('No users found in database.');
        return;
    }

    // 2. Try signing in with the first user's email
    const testEmail = users[0].email;
    console.log(`\nTrying signInWithPassword for: ${testEmail}`);
    const { data: authData, error: authErr } = await supabaseAdmin.auth.signInWithPassword({
        email: testEmail,
        password: 'password123', // guess common test password
    });

    if (authErr) {
        console.error('❌ Auth Error:', authErr.message);
        console.log('This means the password is wrong or the auth user doesnt exist.');
        return;
    }

    console.log('✅ Auth success! User ID:', authData.user?.id);
    console.log('   Session token (first 50):', authData.session?.access_token?.substring(0, 50));

    // 3. Look up the app user via authId
    const authId = authData.user?.id;
    console.log(`\nLooking up user by authId: ${authId}`);
    const { data: appUser, error: dbErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('authId', authId)
        .single();

    if (dbErr) {
        console.error('❌ DB lookup error:', JSON.stringify(dbErr, null, 2));
    } else if (!appUser) {
        console.error('❌ No app user found with this authId');
    } else if (!appUser.isActive) {
        console.error('❌ User is deactivated');
    } else {
        console.log('✅ App user found:', JSON.stringify(appUser, null, 2));
    }
}

testSignin();
