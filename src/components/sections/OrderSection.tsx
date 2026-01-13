import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Send, Sparkles, ImagePlus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const cakeTypes = [
  "Classic Vanilla",
  "Rich Chocolate",
  "Red Velvet",
  "Lemon Blueberry",
  "Carrot Cake",
  "Strawberry Dream",
  "Cookies & Cream",
  "Salted Caramel",
  "Custom/Other",
];

const eventTypes = [
  "Birthday",
  "Wedding",
  "Anniversary",
  "Baby Shower",
  "Graduation",
  "Corporate Event",
  "Holiday",
  "Just Because",
  "Other",
];

export function OrderSection() {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visionImages, setVisionImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + visionImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    
    const newImages = [...visionImages, ...files];
    setVisionImages(newImages);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setVisionImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Create the order first
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: formData.get("name") as string,
          customer_email: formData.get("email") as string,
          customer_phone: formData.get("phone") as string,
          cake_type: formData.get("cakeType") as string,
          event_type: formData.get("eventType") as string,
          event_date: date?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
          servings: formData.get("servings") ? parseInt(formData.get("servings") as string) : null,
          order_notes: formData.get("details") as string,
          user_id: "00000000-0000-0000-0000-000000000000", // Public submission placeholder
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Upload vision board images
      if (visionImages.length > 0 && orderData) {
        for (const file of visionImages) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${orderData.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("vision-board")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from("vision-board")
            .getPublicUrl(fileName);

          // Save reference to database
          await supabase.from("order_vision_images").insert({
            order_id: orderData.id,
            image_url: publicUrl,
            user_id: "00000000-0000-0000-0000-000000000000",
          });
        }
      }

      toast.success("Thank you for your order inquiry! I'll be in touch within 24 hours.", {
        description: "Check your email for confirmation.",
      });
      
      (e.target as HTMLFormElement).reset();
      setDate(undefined);
      setVisionImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Failed to submit order. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="order" className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Start Your Order
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-2">
            Let's Create Something <span className="text-primary">Sweet</span>
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Fill out the form below and I'll get back to you within 24 hours 
            to discuss your perfect creation.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto shadow-warm border-primary/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" />
              Order Consultation Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Jane Smith"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    required
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cake Type *</Label>
                  <Select name="cakeType" required>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a flavor" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {cakeTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Event Type *</Label>
                  <Select name="eventType" required>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="servings">Number of Servings</Label>
                  <Input
                    id="servings"
                    name="servings"
                    type="number"
                    placeholder="e.g., 24"
                    min="6"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Approximate Budget</Label>
                  <Input
                    id="budget"
                    name="budget"
                    placeholder="e.g., $75-100"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Tell Me About Your Vision *</Label>
                <Textarea
                  id="details"
                  name="details"
                  placeholder="Describe your dream cake! Include any themes, colors, decorations, or inspiration you have in mind. Feel free to mention any dietary restrictions as well."
                  rows={5}
                  required
                  className="bg-background resize-none"
                />
              </div>

              {/* Vision Board Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  Vision Board (Optional)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload up to 5 inspiration images for your cake design
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Vision ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {visionImages.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-xs mt-1">Add</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Order Request
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                After submitting, I'll reach out to discuss details and provide 
                a custom quote for your order.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
