import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET!;
const anonKey = process.env.SUPABASE_ANON_KEY!;

console.log('Testing JWT_SECRET with SUPABASE_ANON_KEY...');
console.log('Secret length:', secret.length);

try {
    const decoded = jwt.verify(anonKey, secret);
    console.log('✅ Success! JWT_SECRET is correct.');
    console.log('Decoded:', decoded);
} catch (err: any) {
    console.error('❌ Failed! JWT_SECRET is incorrect.');
    console.error('Error:', err.message);

    // Test if it's meant to be decoded as base64
    try {
        const decoded = jwt.verify(anonKey, Buffer.from(secret, 'base64'));
        console.log('✅ Success with Buffer.from(secret, "base64")!');
    } catch (err2: any) {
        console.error('❌ Also failed with base64 decoding.');
    }
}
