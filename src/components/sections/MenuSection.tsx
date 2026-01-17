import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Cookie, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: string;
  is_available: boolean;
}

const categoryConfig = {
  flavors: { title: "Cake Flavors", icon: Cake },
  specialty: { title: "Specialty Cakes", icon: Sparkles },
  treats: { title: "Pies & Treats", icon: Cookie },
};

export function MenuSection() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data) {
        setMenuItems(data);
      }
      setLoading(false);
    };

    fetchMenuItems();
  }, []);

  const getItemsByCategory = (category: string) => {
    return menuItems.filter((item) => item.category === category);
  };

  return (
    <section id="menu" className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            What I Offer
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2">
            Explore the <span className="text-primary">Menu</span>
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            From classic favorites to custom creations, find the perfect sweet 
            treat for any occasion.
          </p>
        </div>

        <Tabs defaultValue="flavors" className="w-full">
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 mb-12 h-auto p-1 bg-secondary">
            {Object.entries(categoryConfig).map(([key, category]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <category.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(categoryConfig).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  getItemsByCategory(key).map((item) => (
                    <Card 
                      key={item.id} 
                      className="group bg-card hover:shadow-warm transition-all duration-300 border-border/50 hover:border-primary/30"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="font-display text-xl group-hover:text-primary transition-colors">
                          {item.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {item.description}
                        </p>
                        <p className="font-semibold text-primary">
                          {item.is_available ? item.price : "Currently Unavailable"}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 text-center">
          <Card className="inline-block bg-blush-light border-primary/20 px-8 py-6">
            <p className="font-display text-lg">
              <Sparkles className="inline w-5 h-5 text-accent mr-2" />
              <span className="font-semibold">Build Your Own!</span>
              <span className="text-muted-foreground ml-2">
                Can't find what you're looking for? Let's create something custom together.
              </span>
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
