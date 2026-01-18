import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  addInventoryItem,
  deleteInventoryItem,
  listInventoryItems,
  updateInventoryItem,
} from "@/integrations/firebase/firestoreInventory";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  item_name: string;
  is_checked: boolean;
  priority: string;
  notes: string | null;
}

const InventoryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const fetchItems = async () => {
    try {
      const data = await listInventoryItems();
      setItems(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await addInventoryItem({
        user_id: user!.uid,
        item_name: newItemName.trim(),
        is_checked: false,
      });
      setNewItemName("");
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item");
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    try {
      await updateInventoryItem(id, { is_checked: checked });
      setItems(items.map((item) => (item.id === id ? { ...item, is_checked: checked } : item)));
    } catch (error) {
      console.error(error);
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
    }
  };

  const uncheckedItems = items.filter((i) => !i.is_checked);
  const checkedItems = items.filter((i) => i.is_checked);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Inventory Checklist</h1>
          <p className="text-muted-foreground mt-1">Keep track of items you need to restock</p>
        </div>

        {/* Add Item Form */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAddItem} className="flex gap-3">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add an item to check..."
                className="flex-1"
              />
              <Button type="submit" variant="hero">
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              No items in your checklist. Add items you need to keep track of!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Unchecked Items */}
            {uncheckedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">To Get ({uncheckedItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {uncheckedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.is_checked}
                          onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                        />
                        <span className="font-medium">{item.item_name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Checked Items */}
            {checkedItems.length > 0 && (
              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-muted-foreground">
                    Completed ({checkedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {checkedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.is_checked}
                          onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                        />
                        <span className="line-through text-muted-foreground">{item.item_name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;
