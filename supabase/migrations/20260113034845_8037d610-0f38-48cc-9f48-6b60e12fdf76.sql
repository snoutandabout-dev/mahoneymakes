-- Drop existing user-specific RLS policies and replace with team-wide access
-- This allows all authenticated users to view and manage all data

-- INVENTORY_CHECKLIST TABLE
DROP POLICY IF EXISTS "Users can view their own checklist" ON public.inventory_checklist;
DROP POLICY IF EXISTS "Users can insert their own checklist" ON public.inventory_checklist;
DROP POLICY IF EXISTS "Users can update their own checklist" ON public.inventory_checklist;
DROP POLICY IF EXISTS "Users can delete their own checklist" ON public.inventory_checklist;

CREATE POLICY "Team members can view all checklist items" ON public.inventory_checklist
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can insert checklist items" ON public.inventory_checklist
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can update checklist items" ON public.inventory_checklist
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team members can delete checklist items" ON public.inventory_checklist
  FOR DELETE TO authenticated USING (true);

-- ORDER_SUPPLIES TABLE
DROP POLICY IF EXISTS "Users can view their own order supplies" ON public.order_supplies;
DROP POLICY IF EXISTS "Users can insert their own order supplies" ON public.order_supplies;
DROP POLICY IF EXISTS "Users can delete their own order supplies" ON public.order_supplies;

CREATE POLICY "Team members can view all order supplies" ON public.order_supplies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can insert order supplies" ON public.order_supplies
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can update order supplies" ON public.order_supplies
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team members can delete order supplies" ON public.order_supplies
  FOR DELETE TO authenticated USING (true);

-- ORDER_VISION_IMAGES TABLE
DROP POLICY IF EXISTS "Users can view their own vision images" ON public.order_vision_images;
DROP POLICY IF EXISTS "Users can insert their own vision images" ON public.order_vision_images;
DROP POLICY IF EXISTS "Users can delete their own vision images" ON public.order_vision_images;
DROP POLICY IF EXISTS "Authenticated users can view vision images" ON public.order_vision_images;
DROP POLICY IF EXISTS "Anyone can insert vision images for orders" ON public.order_vision_images;

CREATE POLICY "Team members can view all vision images" ON public.order_vision_images
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can insert vision images" ON public.order_vision_images
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can update vision images" ON public.order_vision_images
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team members can delete vision images" ON public.order_vision_images
  FOR DELETE TO authenticated USING (true);

-- ORDERS TABLE
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;

CREATE POLICY "Team members can view all orders" ON public.orders
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can insert orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team members can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (true);

-- PAYMENTS TABLE
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;

CREATE POLICY "Team members can view all payments" ON public.payments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can insert payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can update payments" ON public.payments
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team members can delete payments" ON public.payments
  FOR DELETE TO authenticated USING (true);

-- PROFILES TABLE (allow team members to view all profiles for user management)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Team members can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- SEASONAL_SPECIALS TABLE
DROP POLICY IF EXISTS "Users can view their own seasonal specials" ON public.seasonal_specials;
DROP POLICY IF EXISTS "Users can insert their own seasonal specials" ON public.seasonal_specials;
DROP POLICY IF EXISTS "Users can update their own seasonal specials" ON public.seasonal_specials;
DROP POLICY IF EXISTS "Users can delete their own seasonal specials" ON public.seasonal_specials;

CREATE POLICY "Team members can view all seasonal specials" ON public.seasonal_specials
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can insert seasonal specials" ON public.seasonal_specials
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can update seasonal specials" ON public.seasonal_specials
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team members can delete seasonal specials" ON public.seasonal_specials
  FOR DELETE TO authenticated USING (true);

-- SUPPLIES TABLE
DROP POLICY IF EXISTS "Users can view their own supplies" ON public.supplies;
DROP POLICY IF EXISTS "Users can insert their own supplies" ON public.supplies;
DROP POLICY IF EXISTS "Users can update their own supplies" ON public.supplies;
DROP POLICY IF EXISTS "Users can delete their own supplies" ON public.supplies;

CREATE POLICY "Team members can view all supplies" ON public.supplies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team members can insert supplies" ON public.supplies
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team members can update supplies" ON public.supplies
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Team members can delete supplies" ON public.supplies
  FOR DELETE TO authenticated USING (true);