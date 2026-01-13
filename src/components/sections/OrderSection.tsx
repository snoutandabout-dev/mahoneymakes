import { useState } from "react";
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
import { CalendarIcon, Send, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success("Thank you for your order inquiry! I'll be in touch within 24 hours.", {
      description: "Check your email for confirmation.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
    setDate(undefined);
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
