import dotenv from 'dotenv';
dotenv.config();

console.log('PORT:', process.env.PORT);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY (length):', process.env.SUPABASE_ANON_KEY?.length);
console.log('SUPABASE_SERVICE_ROLE_KEY (length):', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
