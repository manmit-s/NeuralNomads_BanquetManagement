import { supabaseAdmin } from './lib/supabase.js';
import fs from 'fs';
import process from 'process';

async function test() {
    try {
        const { data: users } = await supabaseAdmin.from('users').select('*');
        fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
        console.log('Users saved to users.json');
    } catch (err) {
        console.error('Script error:', err);
    }
    process.exit(0);
}

test();
