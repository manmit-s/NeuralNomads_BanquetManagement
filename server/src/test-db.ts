import { PrismaClient } from "../prisma/generated-client";

const prisma = new PrismaClient();

async function testConnection() {
  console.log('Testing Supabase Database connection...');
  try {
    const branchCount = await prisma.branch.count();
    console.log('✅ Connection successful!');
    console.log(`Found ${branchCount} branches in the database.`);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error details:', error);
    console.log('\nTip: Ensure your DATABASE_URL in the .env file is correct and your Supabase project is active.');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
