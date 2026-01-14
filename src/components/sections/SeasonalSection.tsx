import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Leaf } from "lucide-react";
import seasonalCakeImage from "@/assets/seasonal-mint-chocolate-cake.jpg";

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
              <div className="relative h-64 lg:h-auto overflow-hidden">
                <img 
                  src={seasonalCakeImage} 
                  alt="Mint Chocolate Chip Cake - Our seasonal special featuring mint cake layers with chocolate chips and milk chocolate ganache"
                  className="w-full h-full object-cover"
                />
                {/* Overlay for subtle gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}