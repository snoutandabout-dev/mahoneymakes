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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Pencil, Trash2, Cake, Cookie, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: string;
  is_available: boolean;
  display_order: number;
}

const categories = [
  { value: "flavors", label: "Cake Flavors", icon: Cake },
  { value: "specialty", label: "Specialty Cakes", icon: Sparkles },
  { value: "treats", label: "Pies & Treats", icon: Cookie },
];

const MenuItemsPage = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("flavors");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "flavors",
    price: "",
    is_available: true,
  });

  useEffect(() => {
    if (user) fetchMenuItems();
  }, [user]);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setMenuItems(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update({
            name: formData.name,
            description: formData.description || null,
            category: formData.category,
            price: formData.price,
            is_available: formData.is_available,
          })
          .eq("id", editingItem.id);

        if (error) {
          toast.error("Failed to update menu item");
          return;
        }
        toast.success("Menu item updated successfully");
      } else {
        const maxOrder = menuItems
          .filter((item) => item.category === formData.category)
          .reduce((max, item) => Math.max(max, item.display_order), -1);

        const { error } = await supabase.from("menu_items").insert({
          user_id: user!.id,
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          price: formData.price,
          is_available: formData.is_available,
          display_order: maxOrder + 1,
        });

        if (error) {
          toast.error("Failed to create menu item");
          return;
        }
        toast.success("Menu item created successfully");
      }

      closeDialog();
      fetchMenuItems();
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category,
      price: item.price,
      is_available: item.is_available,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete menu item");
    } else {
      toast.success("Menu item deleted");
      fetchMenuItems();
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: isAvailable })
      .eq("id", id);

    if (!error) {
      setMenuItems(
        menuItems.map((item) =>
          item.id === id ? { ...item, is_available: isAvailable } : item
        )
      );
      toast.success(isAvailable ? "Item is now available" : "Item marked as unavailable");
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      category: "flavors",
      price: "",
      is_available: true,
    });
  };

  const getCategoryItems = (category: string) => {
    return menuItems.filter((item) => item.category === category);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.icon || Cake;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Regular Menu Items</h1>
            <p className="text-muted-foreground mt-1">
              Manage your cake flavors, specialty cakes, and treats
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingItem ? "Edit Menu Item" : "Create Menu Item"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Classic Vanilla"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe this menu item..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price *</Label>
                    <Input
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g., Starting at $45"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">Available on Menu</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle off to show "Currently Unavailable"
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_available: checked })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    {editingItem ? "Update" : "Create"} Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full max-w-lg grid grid-cols-3 mb-6 h-auto p-1 bg-secondary">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <cat.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="mt-0">
              <div className="space-y-3">
                {getCategoryItems(cat.value).length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <cat.icon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        No items in this category yet.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setFormData({ ...formData, category: cat.value });
                          setIsDialogOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add First Item
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  getCategoryItems(cat.value).map((item) => (
                    <Card
                      key={item.id}
                      className={`transition-all ${
                        !item.is_available ? "opacity-60 border-dashed" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display text-lg font-medium truncate">
                                {item.name}
                              </h3>
                              {!item.is_available && (
                                <Badge variant="secondary" className="text-xs">
                                  Unavailable
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <p className="text-primary font-semibold mt-2">
                              {item.is_available ? item.price : "Currently Unavailable"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.is_available}
                              onCheckedChange={(checked) =>
                                toggleAvailability(item.id, checked)
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MenuItemsPage;
