async function testActualApi() {
    console.log('--- Testing Actual API Endpoint ---');
    try {
        const res = await fetch('http://localhost:5000/api/v1/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `api-test-${Date.now()}@example.com`,
                password: "password123",
                name: "API Test",
                role: "BRANCH_MANAGER"
            })
        });

        const data = await res.json() as any;
        console.log('Status Code:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.error('Fetch Error:', e.message);
    }
}

testActualApi();
