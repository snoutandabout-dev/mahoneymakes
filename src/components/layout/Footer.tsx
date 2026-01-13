import { Heart, Instagram, Facebook, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-semibold">
              Mahoney <span className="text-primary">Makes</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Handcrafted with love, baked with passion. Every cake tells a story,
              and we're here to make yours unforgettable.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-xl font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <a href="/#about" className="text-muted-foreground hover:text-primary transition-colors">
                About Me
              </a>
              <a href="/#menu" className="text-muted-foreground hover:text-primary transition-colors">
                Our Menu
              </a>
              <a href="/#gallery" className="text-muted-foreground hover:text-primary transition-colors">
                Gallery
              </a>
              <a href="/#order" className="text-muted-foreground hover:text-primary transition-colors">
                Order Now
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-xl font-semibold">Get in Touch</h4>
            <div className="space-y-3">
              <a
                href="mailto:hello@sweetdelights.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={18} />
                hello@sweetdelights.com
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone size={18} />
                (555) 123-4567
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart size={16} className="text-primary fill-primary" /> by Mahoney Makes
            <span className="mx-2">•</span>
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
