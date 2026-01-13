-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT DEFAULT 'Sweet Delights',
  display_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  cake_type TEXT NOT NULL,
  event_type TEXT,
  event_date DATE NOT NULL,
  servings INTEGER,
  order_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delivered', 'cancelled')),
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own orders" ON public.orders FOR DELETE USING (auth.uid() = user_id);

-- Create order vision board images table
CREATE TABLE public.order_vision_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on order_vision_images
ALTER TABLE public.order_vision_images ENABLE ROW LEVEL SECURITY;

-- Vision images policies
CREATE POLICY "Users can view their own vision images" ON public.order_vision_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vision images" ON public.order_vision_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vision images" ON public.order_vision_images FOR DELETE USING (auth.uid() = user_id);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'final_payment', 'partial')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'zelle', 'paypal', 'cashapp', 'venmo', 'check', 'other')),
  notes TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payments" ON public.payments FOR DELETE USING (auth.uid() = user_id);

-- Create supplies table
CREATE TABLE public.supplies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ingredient', 'packaging', 'equipment', 'other')),
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  low_stock_threshold DECIMAL(10,2) DEFAULT 5,
  is_low_stock BOOLEAN GENERATED ALWAYS AS (current_stock <= low_stock_threshold) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on supplies
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

-- Supplies policies
CREATE POLICY "Users can view their own supplies" ON public.supplies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own supplies" ON public.supplies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own supplies" ON public.supplies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own supplies" ON public.supplies FOR DELETE USING (auth.uid() = user_id);

-- Create order_supplies junction table for cost tracking
CREATE TABLE public.order_supplies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  supply_id UUID NOT NULL REFERENCES public.supplies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity_used DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_used * 0) STORED, -- We'll calculate this in app
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on order_supplies
ALTER TABLE public.order_supplies ENABLE ROW LEVEL SECURITY;

-- Order supplies policies
CREATE POLICY "Users can view their own order supplies" ON public.order_supplies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own order supplies" ON public.order_supplies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own order supplies" ON public.order_supplies FOR DELETE USING (auth.uid() = user_id);

-- Create seasonal specials table
CREATE TABLE public.seasonal_specials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'holiday', 'year_round')),
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on seasonal_specials
ALTER TABLE public.seasonal_specials ENABLE ROW LEVEL SECURITY;

-- Seasonal specials policies
CREATE POLICY "Users can view their own seasonal specials" ON public.seasonal_specials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own seasonal specials" ON public.seasonal_specials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own seasonal specials" ON public.seasonal_specials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own seasonal specials" ON public.seasonal_specials FOR DELETE USING (auth.uid() = user_id);

-- Create inventory checklist table
CREATE TABLE public.inventory_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inventory_checklist
ALTER TABLE public.inventory_checklist ENABLE ROW LEVEL SECURITY;

-- Inventory checklist policies
CREATE POLICY "Users can view their own checklist" ON public.inventory_checklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own checklist" ON public.inventory_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own checklist" ON public.inventory_checklist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own checklist" ON public.inventory_checklist FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplies_updated_at BEFORE UPDATE ON public.supplies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seasonal_specials_updated_at BEFORE UPDATE ON public.seasonal_specials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_checklist_updated_at BEFORE UPDATE ON public.inventory_checklist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for vision board images
INSERT INTO storage.buckets (id, name, public) VALUES ('vision-images', 'vision-images', true);

-- Storage policies for vision images
CREATE POLICY "Users can upload their own vision images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vision-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own vision images" ON storage.objects FOR SELECT USING (bucket_id = 'vision-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own vision images" ON storage.objects FOR DELETE USING (bucket_id = 'vision-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view vision images" ON storage.objects FOR SELECT USING (bucket_id = 'vision-images');