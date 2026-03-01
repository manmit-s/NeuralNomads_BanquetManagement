import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function testRaw() {
    console.log('Testing RAW PG connection...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/:([^@]+)@/, ':****@'));

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ RAW Connection successful!');
        const res = await client.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('❌ RAW Connection failed!');
        console.error(err);
    } finally {
        await client.end();
    }
}

testRaw();
