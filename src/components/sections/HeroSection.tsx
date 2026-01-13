import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bakery.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
      </div>

      {/* Content */}
      <div className="container relative z-10 pt-24">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-2 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <span className="inline-block text-primary font-medium tracking-wider uppercase text-sm">
              Homemade with Love
            </span>
          </div>
          
          <h1 
            className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Delicious <span className="text-primary">Homemade</span> Cakes & Treats
          </h1>
          
          <p 
            className="text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            From custom celebration cakes to fresh-baked pies and pastries, 
            every creation is made from scratch with the finest ingredients 
            and a whole lot of love.
          </p>

          <div 
            className="flex flex-col sm:flex-row gap-4 pt-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.8s" }}
          >
            <Button variant="hero" size="xl" asChild>
              <a href="#order">Order Your Cake</a>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="#menu">View Menu</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
