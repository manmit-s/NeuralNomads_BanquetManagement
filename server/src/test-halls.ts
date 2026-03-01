import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function testHallsApi() {
    try {
        // 1. Sign up a completely new user so we know the password
        console.log('Registering test user...');

        // Generate random email so it doesn't collide
        const email = `test.owner.${Date.now()}@banquet.com`;
        const password = 'Password@123';

        const signupRes = await axios.post(`${API_URL}/auth/signup`, {
            email,
            password,
            name: 'Test Owner',
            phone: '1234567890',
            role: 'OWNER'
        });

        console.log('Signup Res Data:', JSON.stringify(signupRes.data, null, 2));

        // 2. Sign in to get the token
        console.log('Signing in newly registered user...');
        const signinRes = await axios.post(`${API_URL}/auth/signin`, {
            email,
            password
        });

        const token = signinRes.data?.data?.session?.accessToken;
        if (!token) throw new Error('No token returned from signin');
        console.log(`Signed in successfully as ${email}. Token: ${token.substring(0, 20)}...`);

        // 2. Fetch halls
        console.log('\nFetching halls...');
        const hallsRes = await axios.get(`${API_URL}/halls`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Success! Fetched ${hallsRes.data.data.length} halls:`);
        console.log(JSON.stringify(hallsRes.data.data, null, 2));

    } catch (error: any) {
        console.error('API Test Failed:');
        if (error.response) {
            console.error(error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error);
        }
    }
}

testHallsApi();
