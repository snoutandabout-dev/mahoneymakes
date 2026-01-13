import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import chocolateDrip from "@/assets/gallery-chocolate-drip.jpg";
import vanillaChocolate from "@/assets/gallery-vanilla-chocolate.jpg";
import colorfulLayer from "@/assets/gallery-colorful-layer.jpg";
import numberCake from "@/assets/gallery-number-cake.jpg";
import retroBirthday from "@/assets/gallery-retro-birthday.jpg";
import mochaCake from "@/assets/gallery-mocha-cake.jpg";

const galleryImages = [
  { src: chocolateDrip, alt: "Chocolate drip cake with gold and white sprinkles", category: "Chocolate" },
  { src: vanillaChocolate, alt: "Vanilla cake with chocolate pieces and gold decorations", category: "Specialty" },
  { src: colorfulLayer, alt: "Colorful cookie cake with pastel frosting", category: "Cookie Cakes" },
  { src: numberCake, alt: "Number 10 cake with macarons and mint frosting", category: "Number Cakes" },
  { src: retroBirthday, alt: "Retro 90s themed birthday cake with teal and pink", category: "Birthday" },
  { src: mochaCake, alt: "Elegant mocha frosted cake with gold accents", category: "Classic" },
];

export function GallerySection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === galleryImages.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-blush-gradient">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            My Creations
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2">
            Sweet <span className="text-primary">Gallery</span>
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Take a peek at some of my favorite creations. Each one is made with 
            love and attention to every delicious detail.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer shadow-soft hover:shadow-warm transition-all duration-300"
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-sm font-medium bg-primary/80 px-3 py-1 rounded-full">
                  {image.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
          <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0">
            <div className="relative">
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <X size={20} />
              </button>
              
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <ChevronRight size={24} />
              </button>

              {selectedIndex !== null && (
                <img
                  src={galleryImages[selectedIndex].src}
                  alt={galleryImages[selectedIndex].alt}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
