import { Heart, Instagram, Mail, Phone } from "lucide-react";
import logo from "@/assets/mahoney-makes-logo.png";

export function Footer() {
  return (
    <footer className="bg-secondary py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="Mahoney Makes" className="h-48 w-auto" />
            <p className="text-muted-foreground leading-relaxed">
              Handcrafted with love, baked with passion. Every cake tells a story,
              and I'm here to make yours unforgettable.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://instagram.com/mahoney_makes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram size={20} />
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
                Menu
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
                href="mailto:mahoneymakes@gmail.com"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={18} />
                mahoneymakes@gmail.com
              </a>
              <a
                href="tel:+14045830799"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone size={18} />
                (404) 583-0799
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
