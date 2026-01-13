import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface SeasonalSpecial {
  id: string;
  name: string;
  description: string | null;
  season: string;
  price: number | null;
  is_active: boolean;
  order_count: number;
}

const seasons = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "holiday", label: "Holiday" },
  { value: "year_round", label: "Year Round" },
];

const SpecialsPage = () => {
  const { user } = useAuth();
  const [specials, setSpecials] = useState<SeasonalSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<SeasonalSpecial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    season: "spring",
    price: "",
    is_active: true,
  });

  useEffect(() => {
    if (user) fetchSpecials();
  }, [user]);

  const fetchSpecials = async () => {
    const { data, error } = await supabase
      .from("seasonal_specials")
      .select("*")
      .order("order_count", { ascending: false });

    if (!error) setSpecials(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specialData = {
      user_id: user!.id,
      name: formData.name,
      description: formData.description || null,
      season: formData.season,
      price: formData.price ? parseFloat(formData.price) : null,
      is_active: formData.is_active,
    };

    if (editingSpecial) {
      const { error } = await supabase
        .from("seasonal_specials")
        .update(specialData)
        .eq("id", editingSpecial.id);

      if (error) {
        toast.error("Failed to update special");
      } else {
        toast.success("Special updated successfully");
        closeDialog();
        fetchSpecials();
      }
    } else {
      const { error } = await supabase.from("seasonal_specials").insert(specialData);

      if (error) {
        toast.error("Failed to create special");
      } else {
        toast.success("Special created successfully");
        closeDialog();
        fetchSpecials();
      }
    }
  };

  const handleEdit = (special: SeasonalSpecial) => {
    setEditingSpecial(special);
    setFormData({
      name: special.name,
      description: special.description || "",
      season: special.season,
      price: special.price?.toString() || "",
      is_active: special.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this special?")) return;

    const { error } = await supabase.from("seasonal_specials").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete special");
    } else {
      toast.success("Special deleted");
      fetchSpecials();
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("seasonal_specials")
      .update({ is_active: isActive })
      .eq("id", id);

    if (!error) {
      setSpecials(specials.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)));
    }
  };

  const incrementOrderCount = async (id: string) => {
    const special = specials.find((s) => s.id === id);
    if (!special) return;

    const { error } = await supabase
      .from("seasonal_specials")
      .update({ order_count: special.order_count + 1 })
      .eq("id", id);

    if (!error) {
      setSpecials(
        specials.map((s) => (s.id === id ? { ...s, order_count: s.order_count + 1 } : s))
      );
      toast.success("Order count updated!");
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSpecial(null);
    setFormData({
      name: "",
      description: "",
      season: "spring",
      price: "",
      is_active: true,
    });
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case "spring": return "bg-green-100 text-green-800";
      case "summer": return "bg-yellow-100 text-yellow-800";
      case "fall": return "bg-orange-100 text-orange-800";
      case "winter": return "bg-blue-100 text-blue-800";
      case "holiday": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Seasonal Specials</h1>
            <p className="text-muted-foreground mt-1">Track popularity of your seasonal offerings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Special
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingSpecial ? "Edit Special" : "Create Seasonal Special"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pumpkin Spice Cake"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your seasonal creation..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Season *</Label>
                    <Select
                      value={formData.season}
                      onValueChange={(v) => setFormData({ ...formData, season: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {seasons.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Currently Available</Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    {editingSpecial ? "Update Special" : "Create Special"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : specials.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-accent" />
              <p>No seasonal specials yet. Add your first seasonal offering!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {specials.map((special) => (
              <Card
                key={special.id}
                className={!special.is_active ? "opacity-60" : ""}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{special.name}</h3>
                        <Badge className={getSeasonColor(special.season)}>
                          {seasons.find((s) => s.value === special.season)?.label}
                        </Badge>
                      </div>
                      {special.description && (
                        <p className="text-sm text-muted-foreground mb-3">{special.description}</p>
                      )}
                      <div className="flex items-center gap-4">
                        {special.price && (
                          <span className="font-semibold text-primary">
                            ${Number(special.price).toFixed(2)}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          {special.order_count} orders
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Switch
                        checked={special.is_active}
                        onCheckedChange={(checked) => toggleActive(special.id, checked)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementOrderCount(special.id)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Order
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(special)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(special.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SpecialsPage;
