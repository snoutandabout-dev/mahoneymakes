import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake, Cookie, Sparkles } from "lucide-react";

const menuCategories = {
  flavors: {
    title: "Cake Flavors",
    icon: Cake,
    items: [
      { name: "Classic Vanilla", description: "Light and fluffy vanilla bean cake with buttercream", price: "Starting at $45" },
      { name: "Rich Chocolate", description: "Decadent dark chocolate layers with ganache", price: "Starting at $48" },
      { name: "Red Velvet", description: "Southern classic with cream cheese frosting", price: "Starting at $50" },
      { name: "Lemon Blueberry", description: "Fresh lemon cake with blueberry compote", price: "Starting at $52" },
      { name: "Carrot Cake", description: "Spiced carrot cake with walnuts and cream cheese", price: "Starting at $48" },
      { name: "Strawberry Dream", description: "Fresh strawberry cake with strawberry buttercream", price: "Starting at $52" },
      { name: "Cookies & Cream", description: "Oreo-studded cake with cookies & cream frosting", price: "Starting at $50" },
      { name: "Salted Caramel", description: "Brown butter cake with salted caramel drizzle", price: "Starting at $55" },
    ],
  },
  specialty: {
    title: "Specialty Cakes",
    icon: Sparkles,
    items: [
      { name: "Wedding Cakes", description: "Multi-tiered elegance for your special day", price: "Custom quote" },
      { name: "Birthday Celebration", description: "Themed cakes for kids and adults alike", price: "Starting at $65" },
      { name: "Graduation Cakes", description: "Celebrate achievements in style", price: "Starting at $55" },
      { name: "Baby Shower", description: "Sweet designs for welcoming little ones", price: "Starting at $60" },
      { name: "Anniversary", description: "Romantic designs for milestone celebrations", price: "Starting at $70" },
      { name: "Holiday Specials", description: "Seasonal favorites throughout the year", price: "Varies" },
    ],
  },
  treats: {
    title: "Pies & Treats",
    icon: Cookie,
    items: [
      { name: "Apple Pie", description: "Classic lattice-top with cinnamon apples", price: "$28" },
      { name: "Pecan Pie", description: "Rich Southern-style pecan pie", price: "$32" },
      { name: "Cupcakes (dozen)", description: "Your choice of flavors, beautifully decorated", price: "$36" },
      { name: "Cake Pops (dozen)", description: "Bite-sized cake on a stick", price: "$24" },
      { name: "Cheesecake", description: "Creamy NY-style with optional toppings", price: "$45" },
      { name: "Assorted Cookies", description: "Fresh-baked cookies (2 dozen)", price: "$28" },
    ],
  },
};

export function MenuSection() {
  return (
    <section id="menu" className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Our Offerings
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2">
            Explore Our <span className="text-primary">Menu</span>
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            From classic favorites to custom creations, find the perfect sweet 
            treat for any occasion.
          </p>
        </div>

        <Tabs defaultValue="flavors" className="w-full">
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 mb-12 h-auto p-1 bg-secondary">
            {Object.entries(menuCategories).map(([key, category]) => (
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

          {Object.entries(menuCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, index) => (
                  <Card 
                    key={item.name} 
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
                      <p className="font-semibold text-primary">{item.price}</p>
                    </CardContent>
                  </Card>
                ))}
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
