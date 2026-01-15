import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import defaultSeasonalImage from "@/assets/seasonal-mint-chocolate-cake.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SpecialImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface SeasonalSpecial {
  id: string;
  name: string;
  description: string | null;
  season: string;
  price: number | null;
  is_active: boolean | null;
  image_url: string | null;
  images?: SpecialImage[];
}

export function SeasonalSection() {
  const [activeSpecial, setActiveSpecial] = useState<SeasonalSpecial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSpecial();
  }, []);

  const fetchActiveSpecial = async () => {
    const { data, error } = await supabase
      .from("seasonal_specials")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      // Fetch images for the special
      const { data: images } = await supabase
        .from("seasonal_special_images")
        .select("*")
        .eq("special_id", data.id)
        .order("display_order", { ascending: true });
      
      setActiveSpecial({ ...data, images: images || [] });
    }
    setLoading(false);
  };

  const scrollToOrder = () => {
    const orderSection = document.getElementById("order");
    orderSection?.scrollIntoView({ behavior: "smooth" });
  };

  const getSeasonLabel = (season: string) => {
    const seasonLabels: Record<string, string> = {
      spring: "Spring Special",
      summer: "Summer Special",
      fall: "Fall Special",
      winter: "Winter Special",
      holiday: "Holiday Special",
    };
    return seasonLabels[season] || "Seasonal Special";
  };

  // Get all images to display (from images table, fallback to image_url, then default)
  const getDisplayImages = (): string[] => {
    if (!activeSpecial) return [defaultSeasonalImage];
    
    if (activeSpecial.images && activeSpecial.images.length > 0) {
      return activeSpecial.images.map((img) => img.image_url);
    }
    
    if (activeSpecial.image_url) {
      return [activeSpecial.image_url];
    }
    
    return [defaultSeasonalImage];
  };

  // Don't render if loading or no active special
  if (loading) {
    return null;
  }

  if (!activeSpecial) {
    return null;
  }

  const displayImages = getDisplayImages();
  const hasMultipleImages = displayImages.length > 1;

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
                    {getSeasonLabel(activeSpecial.season)}
                  </span>
                </div>
                
                <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
                  {activeSpecial.name}
                </h2>
                
                {activeSpecial.description && (
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {activeSpecial.description}
                  </p>
                )}
                
                {activeSpecial.price && (
                  <div className="mb-6">
                    <span className="text-2xl font-semibold text-primary">
                      Starting at ${activeSpecial.price.toFixed(2)}
                    </span>
                  </div>
                )}
                
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
              
              {/* Visual Side - Carousel if multiple images */}
              <div className="relative h-64 lg:h-auto overflow-hidden">
                {hasMultipleImages ? (
                  <Carousel className="w-full h-full">
                    <CarouselContent className="h-full">
                      {displayImages.map((imageUrl, index) => (
                        <CarouselItem key={index} className="h-full">
                          <div className="relative h-64 lg:h-full w-full">
                            <img 
                              src={imageUrl} 
                              alt={`${activeSpecial.name} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 bg-background/80 hover:bg-background" />
                    <CarouselNext className="right-2 bg-background/80 hover:bg-background" />
                  </Carousel>
                ) : (
                  <img 
                    src={displayImages[0]} 
                    alt={`${activeSpecial.name} - Our seasonal special`}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Overlay for subtle gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
