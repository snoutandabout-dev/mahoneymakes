import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Supply {
  id: string;
  name: string;
  category: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
}

const categories = [
  { value: "ingredient", label: "Ingredient" },
  { value: "packaging", label: "Packaging" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];

const SuppliesPage = () => {
  const { user } = useAuth();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "ingredient",
    unit: "",
    unit_price: "",
    current_stock: "",
    low_stock_threshold: "5",
  });

  useEffect(() => {
    if (user) fetchSupplies();
  }, [user]);

  const fetchSupplies = async () => {
    const { data, error } = await supabase
      .from("supplies")
      .select("*")
      .order("category", { ascending: true });

    if (!error) setSupplies(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const supplyData = {
      user_id: user!.id,
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      unit_price: parseFloat(formData.unit_price),
      current_stock: parseFloat(formData.current_stock) || 0,
      low_stock_threshold: parseFloat(formData.low_stock_threshold),
    };

    if (editingSupply) {
      const { error } = await supabase
        .from("supplies")
        .update(supplyData)
        .eq("id", editingSupply.id);

      if (error) {
        toast.error("Failed to update supply");
      } else {
        toast.success("Supply updated successfully");
        closeDialog();
        fetchSupplies();
      }
    } else {
      const { error } = await supabase.from("supplies").insert(supplyData);

      if (error) {
        toast.error("Failed to add supply");
      } else {
        toast.success("Supply added successfully");
        closeDialog();
        fetchSupplies();
      }
    }
  };

  const handleEdit = (supply: Supply) => {
    setEditingSupply(supply);
    setFormData({
      name: supply.name,
      category: supply.category,
      unit: supply.unit,
      unit_price: supply.unit_price.toString(),
      current_stock: supply.current_stock.toString(),
      low_stock_threshold: supply.low_stock_threshold.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supply?")) return;

    const { error } = await supabase.from("supplies").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete supply");
    } else {
      toast.success("Supply deleted");
      fetchSupplies();
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSupply(null);
    setFormData({
      name: "",
      category: "ingredient",
      unit: "",
      unit_price: "",
      current_stock: "",
      low_stock_threshold: "5",
    });
  };

  const groupedSupplies = supplies.reduce((acc, supply) => {
    if (!acc[supply.category]) acc[supply.category] = [];
    acc[supply.category].push(supply);
    return acc;
  }, {} as Record<string, Supply[]>);

  const lowStockCount = supplies.filter((s) => s.is_low_stock).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Supplies</h1>
            <p className="text-muted-foreground mt-1">Track ingredients and packaging costs</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Supply
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingSupply ? "Edit Supply" : "Add New Supply"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., All-Purpose Flour"
                    required
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
                        {categories.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit *</Label>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., lb, oz, each"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Stock</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Low Stock Alert Threshold</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                    placeholder="5"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    {editingSupply ? "Update Supply" : "Add Supply"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Low Stock Warning */}
        {lowStockCount > 0 && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-destructive font-medium">
                {lowStockCount} {lowStockCount === 1 ? "item is" : "items are"} running low on stock
              </p>
            </CardContent>
          </Card>
        )}

        {/* Supplies List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : supplies.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              No supplies added yet. Start tracking your ingredients and costs!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSupplies).map(([category, items]) => (
              <div key={category}>
                <h2 className="font-display text-xl font-semibold capitalize mb-4">{category}s</h2>
                <div className="grid gap-3">
                  {items.map((supply) => (
                    <Card
                      key={supply.id}
                      className={supply.is_low_stock ? "border-destructive/30 bg-destructive/5" : ""}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{supply.name}</p>
                              {supply.is_low_stock && (
                                <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ${Number(supply.unit_price).toFixed(2)} per {supply.unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">
                                {supply.current_stock} {supply.unit}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Reorder at: {supply.low_stock_threshold}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(supply)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(supply.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SuppliesPage;
