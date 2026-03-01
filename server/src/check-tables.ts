import { supabaseAdmin } from './lib/supabase.js';

async function checkTables() {
    console.log('--- Checking Supabase Tables via REST API ---');
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error checking "users" table:', error.message);
        if (error.message.includes('relation "users" does not exist')) {
            console.log('💡 CONFIRMED: The "users" table DOES NOT exist in the database.');
        }
    } else {
        console.log('✅ Success! "users" table exists.');
    }
}

checkTables();
