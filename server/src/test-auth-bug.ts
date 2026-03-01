import { supabaseAdmin } from './lib/supabase.js';
import jwt from 'jsonwebtoken';
import { config } from './config/index.js';

async function checkAuthIssue() {
    console.log('--- Checking User and JWT ---');

    // 1. Get recent users
    const { data: users, error: dbError } = await supabaseAdmin
        .from('users')
        .select('id, authId, email, name, role, branchId, isActive')
        .order('createdAt', { ascending: false })
        .limit(5);

    if (dbError) {
        console.error('DB Error fetching users:', dbError);
    } else {
        console.log('Recent Users in DB:');
        console.log(JSON.stringify(users, null, 2));
    }

    // 2. Sign in to get token
    const signinRes = await fetch('http://localhost:5000/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '61vedant.nikumbh@gmail.jghjk', password: 'trgfhunbhjn' })
    });

    const signinData = await signinRes.json() as any;
    console.log('\nSignin:', signinRes.status, signinData.success ? 'Success' : 'Fail');

    if (signinData.success) {
        const token = signinData.data.session.accessToken;
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            console.log('JWT Verification Success via string secret!');
            console.log('Decoded sub:', (decoded as any).sub);
        } catch (e: any) {
            console.error('JWT String Verify Error:', e.message);
            try {
                const decodedBase64 = jwt.verify(token, Buffer.from(config.jwt.secret, 'base64'), { algorithms: ["HS256"] });
                console.log('JWT Verification Success via Base64 secret!');
            } catch (e2: any) {
                console.error('JWT Base64 Verify Error:', e2.message);

                try {
                    const decodedString = jwt.verify(token, config.jwt.secret, { algorithms: ["HS256"] });
                    console.log('JWT Verification Success via string secret with alg!');
                } catch (e3: any) {
                    console.error('JWT String Verify Error 2:', e3.message);
                }
            }
        }
    }
}

checkAuthIssue();
