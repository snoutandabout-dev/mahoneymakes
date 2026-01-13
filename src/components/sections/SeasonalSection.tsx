import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Leaf } from "lucide-react";

export function SeasonalSection() {
  const scrollToOrder = () => {
    const orderSection = document.getElementById("order");
    orderSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="h-5 w-5 text-primary" />
                  <span className="text-primary font-medium tracking-wider uppercase text-sm">
                    Seasonal Special
                  </span>
                </div>
                
                <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
                  Mint Chocolate Chip Cake
                </h2>
                
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Our limited-time favorite is back! Cool mint cake layers filled with 
                  chocolate chips and topped with a luxurious{" "}
                  <span className="text-foreground font-medium">milk chocolate ganache</span>. 
                  The perfect balance of refreshing mint and rich chocolate.
                </p>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Fresh Mint
                  </span>
                  <span className="px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium">
                    Chocolate Chips
                  </span>
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                    Milk Chocolate Ganache
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button onClick={scrollToOrder} size="lg" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Order Now
                  </Button>
                  <p className="text-muted-foreground text-sm">
                    Available for a limited time only
                  </p>
                </div>
              </div>
              
              {/* Visual Side */}
              <div className="relative h-64 lg:h-auto bg-gradient-to-br from-primary/20 via-accent/10 to-secondary overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Cake illustration with shapes */}
                    <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shadow-2xl">
                      <div className="w-36 h-36 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl lg:text-5xl mb-2">🍫</div>
                          <div className="text-xl lg:text-2xl">🌿</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating decorative elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent/40 rounded-full animate-pulse" />
                    <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-primary/40 rounded-full animate-pulse delay-300" />
                    <div className="absolute top-1/2 -right-8 w-4 h-4 bg-secondary rounded-full animate-pulse delay-500" />
                  </div>
                </div>
                
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 text-6xl">✨</div>
                  <div className="absolute bottom-8 right-8 text-4xl">🍃</div>
                  <div className="absolute top-1/3 right-4 text-3xl">🍫</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}