import { supabaseAdmin } from './src/lib/supabase.js';
import process from 'process';

async function test() {
    try {
        const { data, error } = await supabaseAdmin.from('bookings').select('*').limit(1);
        if (error) {
            console.error('Error fetching bookings:', error);
            process.exit(1);
        }
        if (data && data.length > 0) {
            console.log('Columns in bookings table:');
            console.log(JSON.stringify(Object.keys(data[0]), null, 2));
        } else {
            console.log('No bookings found. Checking leads table as backup...');
            const { data: leadData, error: leadError } = await supabaseAdmin.from('leads').select('*').limit(1);
            if (leadError) {
                console.error('Error fetching leads:', leadError);
            } else if (leadData && leadData.length > 0) {
                console.log('Columns in leads table:');
                console.log(JSON.stringify(Object.keys(leadData[0]), null, 2));
            } else {
                console.log('No data found in bookings or leads tables.');
            }
        }
    } catch (err) {
        console.error('Script error:', err);
    }
    process.exit(0);
}

test();
