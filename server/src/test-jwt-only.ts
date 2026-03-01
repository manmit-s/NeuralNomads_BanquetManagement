import jwt from 'jsonwebtoken';
import { config } from './config/index.js';

async function checkJWT() {
    console.log('--- JWT ONLY ---');
    const signinRes = await fetch('http://localhost:5000/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '61vedant.nikumbh@gmail.jghjk', password: 'trgfhunbhjn' })
    });

    const signinData = await signinRes.json() as any;
    if (!signinData.success) {
        console.error('Signin failed');
        return;
    }

    const token = signinData.data.session.accessToken;
    const secret = config.jwt.secret;
    console.log('Token starts with:', token.slice(0, 15));
    console.log('Secret starts with:', secret.slice(0, 15));

    try {
        jwt.verify(token, Buffer.from(secret, 'base64'), { algorithms: ['HS256'] });
        console.log('SUCCESS: base64 buffer');
    } catch (e: any) {
        console.log('FAIL base64:', e.message);
    }

    try {
        jwt.verify(token, secret, { algorithms: ['HS256'] });
        console.log('SUCCESS: plain string');
    } catch (e: any) {
        console.log('FAIL plain string:', e.message);
    }
}
checkJWT();
