import { AuthService } from './services/auth.service.js';
import dotenv from 'dotenv';
dotenv.config();

async function testAuth() {
    console.log('Testing AuthService.signIn...');
    try {
        // This will likely fail with 401 if creds wrong, or 500 if DB fails
        const result = await AuthService.signIn('test@test.com', 'password');
        console.log('Result:', result);
    } catch (err: any) {
        console.error('❌ AuthService.signIn FAILED!');
        console.error('Status:', err.statusCode || 500);
        console.error('Message:', err.message);
        if (err.stack) console.error('Stack:', err.stack);
    }
}

testAuth();
