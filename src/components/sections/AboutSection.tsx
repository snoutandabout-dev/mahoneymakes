import bakerImage from "@/assets/baker-portrait.jpg";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-warm-gradient">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-warm">
              <img
                src={bakerImage}
                alt="Baker creating a beautiful cake"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-blush-gradient opacity-60" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gold-light/40" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                My Story
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2">
                Baking from the <span className="text-primary">Heart</span>
              </h2>
            </div>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Hi, I'm Sarah! What started as a love for baking in my grandmother's 
                kitchen has blossomed into a passion that I get to share with my 
                community every single day.
              </p>
              <p>
                I remember standing on a little stool, watching my grandmother 
                transform simple ingredients into magical creations. Those memories 
                inspired me to start Mahoney Makes, where every cake, pie, and 
                pastry is made with the same love and care.
              </p>
              <p>
                Each creation is baked fresh to order using premium ingredients — 
                real butter, farm-fresh eggs, pure vanilla, and seasonal fruits. 
                I believe that the best desserts come from quality ingredients and 
                attention to every little detail.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="font-display text-3xl md:text-4xl font-semibold text-primary">8+</div>
                <div className="text-sm text-muted-foreground mt-1">Years Baking</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl md:text-4xl font-semibold text-primary">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl md:text-4xl font-semibold text-primary">50+</div>
                <div className="text-sm text-muted-foreground mt-1">Unique Flavors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
