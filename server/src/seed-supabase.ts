import { supabaseAdmin } from './lib/supabase.js';
import process from 'process';

const OWNER_ID = 'cmm6wg4o40001ngfwuobjx2yu';
const BRANCH_MUMBAI = '89cb367b-e4c5-4f71-93b6-be3df7ee93c7';
const BRANCH_DELHI = 'cmm72bdjt0000u1m4mwp1bi5y';
const BRANCH_PUNE = 'cmm72bdsm0001u1m4e7fmkc8t';

async function seed() {
    try {
        console.log('🌱 Seeding operational data for all branches...');

        // ── 1. Inventory Items ──
        const inventory = [
            // Mumbai
            { name: 'Basmati Rice', category: 'Grain', unit: 'kg', currentStock: 500, minStockLevel: 50, costPerUnit: 80, branchId: BRANCH_MUMBAI },
            { name: 'Paneer', category: 'Dairy', unit: 'kg', currentStock: 200, minStockLevel: 20, costPerUnit: 320, branchId: BRANCH_MUMBAI },
            // Delhi
            { name: 'Atta (Flour)', category: 'Grain', unit: 'kg', currentStock: 800, minStockLevel: 100, costPerUnit: 45, branchId: BRANCH_DELHI },
            { name: 'Refined Oil', category: 'Oil', unit: 'L', currentStock: 300, minStockLevel: 50, costPerUnit: 140, branchId: BRANCH_DELHI },
            // Pune
            { name: 'Sugar', category: 'Spice', unit: 'kg', currentStock: 400, minStockLevel: 40, costPerUnit: 42, branchId: BRANCH_PUNE },
            { name: 'Tea Leaves', category: 'Beverage', unit: 'kg', currentStock: 100, minStockLevel: 10, costPerUnit: 450, branchId: BRANCH_PUNE },
        ];

        console.log('Inserting inventory...');
        for (const item of inventory) {
            await supabaseAdmin.from('inventory_items').insert({
                id: crypto.randomUUID(),
                ...item,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // ── 2. Menu Items ──
        const menuItems = [
            { name: 'Veg Biryani', category: 'Main Course', pricePerPlate: 250, isVeg: true, branchId: BRANCH_MUMBAI },
            { name: 'Butter Chicken', category: 'Main Course', pricePerPlate: 450, isVeg: false, branchId: BRANCH_DELHI },
            { name: 'Puran Poli', category: 'Dessert', pricePerPlate: 120, isVeg: true, branchId: BRANCH_PUNE },
        ];

        console.log('Inserting menu items...');
        for (const item of menuItems) {
            await supabaseAdmin.from('menu_items').insert({
                id: crypto.randomUUID(),
                ...item,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // ── 3. Vendors ──
        const vendors = [
            { name: 'Royal Decorators', service: 'Decoration', phone: '9876543299', email: 'royal@decorators.com', branchId: BRANCH_MUMBAI },
            { name: 'Capital Caterers', service: 'Catering', phone: '9111122233', email: 'info@capital.com', branchId: BRANCH_DELHI },
            { name: 'Sahyadri Sounds', service: 'Audio/Visual', phone: '9222233344', email: 'events@sahyadri.com', branchId: BRANCH_PUNE },
        ];

        console.log('Inserting vendors...');
        for (const v of vendors) {
            await supabaseAdmin.from('vendors').insert({
                id: crypto.randomUUID(),
                ...v,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // ── 4. Additional Leads ──
        const leads = [
            { customerName: 'Amit Shah', customerPhone: '9822001122', eventType: 'Corporate', branchId: BRANCH_MUMBAI, status: 'CALL', assignedToId: OWNER_ID, createdById: OWNER_ID },
            { customerName: 'Neha Gupta', customerPhone: '9877665544', eventType: 'Birthday', branchId: BRANCH_DELHI, status: 'VISIT', assignedToId: OWNER_ID, createdById: OWNER_ID },
            { customerName: 'Rahul Deshmukh', customerPhone: '9988776655', eventType: 'Reception', branchId: BRANCH_PUNE, status: 'NEGOTIATION', assignedToId: OWNER_ID, createdById: OWNER_ID },
        ];

        console.log('Inserting leads...');
        for (const l of leads) {
            await supabaseAdmin.from('leads').insert({
                id: crypto.randomUUID(),
                ...l,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        console.log('✅ Seeding complete!');
    } catch (err) {
        console.error('Seeding error:', err);
    }
    process.exit(0);
}

seed();
