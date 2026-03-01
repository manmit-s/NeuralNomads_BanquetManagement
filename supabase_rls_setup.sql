-- ─────────────────────────────────────────────────────────────────
-- Supabase Roles & Branch Isolation Initialization Script
-- ─────────────────────────────────────────────────────────────────

-- 1. Helper functions to get current user context securely based on Supabase Auth
-- These functions extract the role and branchId dynamically from the public.users table 
-- when Row-Level Security evaluates an incoming query.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role::text FROM users WHERE "authId" = auth.uid()::text LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_branch_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT "branchId" FROM users WHERE "authId" = auth.uid()::text LIMIT 1;
$$;

-- 2. Enable RLS on all tenant-aware tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- 3. Users Table Policies
-- Owners see everyone, Branch Managers see people in their branch, users see themselves
CREATE POLICY "owner_all_users" ON users FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "branch_manager_users" ON users FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id() AND public.current_user_role() = 'BRANCH_MANAGER');
CREATE POLICY "users_read_self" ON users FOR SELECT TO authenticated USING ("authId" = auth.uid()::text);

-- 4. Branches Table Policies
CREATE POLICY "owner_all_branches" ON branches FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "branch_manager_self_branch" ON branches FOR SELECT TO authenticated USING (id = public.current_user_branch_id());

-- 5. Standard Branch Isolation (Halls, Leads, Bookings, Events, Menu Items, etc.)
-- Halls
CREATE POLICY "owner_all_halls" ON halls FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_halls" ON halls FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- Leads
CREATE POLICY "owner_all_leads" ON leads FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_leads" ON leads FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- Bookings
CREATE POLICY "owner_all_bookings" ON bookings FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_bookings" ON bookings FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- Events
CREATE POLICY "owner_all_events" ON events FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_events" ON events FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- Menu Items
CREATE POLICY "owner_all_menu_items" ON menu_items FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_menu_items" ON menu_items FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- Inventory Items
CREATE POLICY "owner_all_inventory_items" ON inventory_items FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_inventory_items" ON inventory_items FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- Vendors
CREATE POLICY "owner_all_vendors" ON vendors FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_vendors" ON vendors FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- Purchase Orders
CREATE POLICY "owner_all_purchase_orders" ON purchase_orders FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_purchase_orders" ON purchase_orders FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- Invoices
CREATE POLICY "owner_all_invoices" ON invoices FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_invoices" ON invoices FOR ALL TO authenticated USING ("branchId" = public.current_user_branch_id());

-- 6. Dependent Tables (Joins for authorization)
-- Lead Activities
CREATE POLICY "owner_all_lead_activities" ON lead_activities FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_lead_activities" ON lead_activities FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_activities."leadId" AND leads."branchId" = public.current_user_branch_id()));

-- Payments
CREATE POLICY "owner_all_payments" ON payments FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_payments" ON payments FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payments."invoiceId" AND invoices."branchId" = public.current_user_branch_id()));

-- Stock Movements
CREATE POLICY "owner_all_stock_movements" ON stock_movements FOR ALL TO authenticated USING (public.current_user_role() = 'OWNER');
CREATE POLICY "tenant_stock_movements" ON stock_movements FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM inventory_items WHERE inventory_items.id = stock_movements."inventoryItemId" AND inventory_items."branchId" = public.current_user_branch_id()));
