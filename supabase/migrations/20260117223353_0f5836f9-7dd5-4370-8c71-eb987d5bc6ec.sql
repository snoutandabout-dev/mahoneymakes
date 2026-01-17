-- Create menu_items table for managing regular menu items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('flavors', 'specialty', 'treats')),
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS policies - only authenticated users can manage menu items
CREATE POLICY "Authenticated users can view menu items"
ON public.menu_items FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert menu items"
ON public.menu_items FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update menu items"
ON public.menu_items FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete menu items"
ON public.menu_items FOR DELETE
USING (auth.role() = 'authenticated');

-- Public can view available menu items (for the public website)
CREATE POLICY "Public can view available menu items"
ON public.menu_items FOR SELECT
USING (is_available = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial menu items from the hardcoded values
INSERT INTO public.menu_items (user_id, category, name, description, price, display_order) VALUES
-- Cake Flavors
('00000000-0000-0000-0000-000000000000', 'flavors', 'Classic Vanilla', 'Light and fluffy vanilla bean cake with buttercream', 'Starting at $45', 0),
('00000000-0000-0000-0000-000000000000', 'flavors', 'Rich Chocolate', 'Decadent dark chocolate layers with ganache', 'Starting at $48', 1),
('00000000-0000-0000-0000-000000000000', 'flavors', 'Red Velvet', 'Southern classic with cream cheese frosting', 'Starting at $50', 2),
('00000000-0000-0000-0000-000000000000', 'flavors', 'Lemon Blueberry', 'Fresh lemon cake with blueberry compote', 'Starting at $52', 3),
('00000000-0000-0000-0000-000000000000', 'flavors', 'Carrot Cake', 'Spiced carrot cake with walnuts and cream cheese', 'Starting at $48', 4),
('00000000-0000-0000-0000-000000000000', 'flavors', 'Strawberry Dream', 'Fresh strawberry cake with strawberry buttercream', 'Starting at $52', 5),
('00000000-0000-0000-0000-000000000000', 'flavors', 'Cookies & Cream', 'Oreo-studded cake with cookies & cream frosting', 'Starting at $50', 6),
('00000000-0000-0000-0000-000000000000', 'flavors', 'Salted Caramel', 'Brown butter cake with salted caramel drizzle', 'Starting at $55', 7),
-- Specialty Cakes
('00000000-0000-0000-0000-000000000000', 'specialty', 'Wedding Cakes', 'Multi-tiered elegance for your special day', 'Custom quote', 0),
('00000000-0000-0000-0000-000000000000', 'specialty', 'Birthday Celebration', 'Themed cakes for kids and adults alike', 'Starting at $65', 1),
('00000000-0000-0000-0000-000000000000', 'specialty', 'Graduation Cakes', 'Celebrate achievements in style', 'Starting at $55', 2),
('00000000-0000-0000-0000-000000000000', 'specialty', 'Baby Shower', 'Sweet designs for welcoming little ones', 'Starting at $60', 3),
('00000000-0000-0000-0000-000000000000', 'specialty', 'Anniversary', 'Romantic designs for milestone celebrations', 'Starting at $70', 4),
('00000000-0000-0000-0000-000000000000', 'specialty', 'Holiday Specials', 'Seasonal favorites throughout the year', 'Varies', 5),
-- Pies & Treats
('00000000-0000-0000-0000-000000000000', 'treats', 'Apple Pie', 'Classic lattice-top with cinnamon apples', '$28', 0),
('00000000-0000-0000-0000-000000000000', 'treats', 'Pecan Pie', 'Rich Southern-style pecan pie', '$32', 1),
('00000000-0000-0000-0000-000000000000', 'treats', 'Cupcakes (dozen)', 'Your choice of flavors, beautifully decorated', '$36', 2),
('00000000-0000-0000-0000-000000000000', 'treats', 'Cake Pops (dozen)', 'Bite-sized cake on a stick', '$24', 3),
('00000000-0000-0000-0000-000000000000', 'treats', 'Cheesecake', 'Creamy NY-style with optional toppings', '$45', 4),
('00000000-0000-0000-0000-000000000000', 'treats', 'Assorted Cookies', 'Fresh-baked cookies (2 dozen)', '$28', 5);