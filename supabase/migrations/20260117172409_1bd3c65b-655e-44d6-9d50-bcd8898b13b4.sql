-- Fix: Restrict profiles table SELECT to authenticated users only
DROP POLICY IF EXISTS "Team members can view all profiles" ON public.profiles;
CREATE POLICY "Team members can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix: Restrict orders table SELECT to authenticated users only
DROP POLICY IF EXISTS "Team members can view all orders" ON public.orders;
CREATE POLICY "Team members can view all orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);