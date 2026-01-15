import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Calendar, Search, Eye, ImageIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog as ImageDialog, DialogContent as ImageDialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VisionImage {
  id: string;
  image_url: string;
  caption: string | null;
  order_id: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  cake_type: string;
  event_type: string | null;
  event_date: string;
  servings: number | null;
  order_notes: string | null;
  status: string;
  deposit_amount: number;
  total_amount: number;
  created_at: string;
  vision_images?: VisionImage[];
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const cakeTypes = [
  "Classic Vanilla", "Rich Chocolate", "Red Velvet", "Lemon Blueberry",
  "Carrot Cake", "Strawberry Dream", "Cookies & Cream", "Salted Caramel",
  "Wedding Cake", "Custom"
];

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visionImages, setVisionImages] = useState<VisionImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    cake_type: "",
    event_type: "",
    event_date: "",
    servings: "",
    order_notes: "",
    deposit_amount: "",
    total_amount: "",
    status: "pending",
  });

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      toast.error("Failed to fetch orders");
    } else {
      setOrders(data || []);
    }
    
    // Fetch vision images
    const { data: imagesData } = await supabase
      .from("order_vision_images")
      .select("*");
    
    if (imagesData) {
      setVisionImages(imagesData);
    }
    
    setLoading(false);
  };

  const getOrderVisionImages = (orderId: string) => {
    return visionImages.filter(img => img.order_id === orderId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      user_id: user!.id,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || null,
      customer_phone: formData.customer_phone,
      cake_type: formData.cake_type,
      event_type: formData.event_type || null,
      event_date: formData.event_date,
      servings: formData.servings ? parseInt(formData.servings) : null,
      order_notes: formData.order_notes || null,
      deposit_amount: parseFloat(formData.deposit_amount) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
      status: formData.status,
    };

    if (selectedOrder) {
      const { error } = await supabase
        .from("orders")
        .update(orderData)
        .eq("id", selectedOrder.id);

      if (error) {
        toast.error("Failed to update order");
      } else {
        toast.success("Order updated successfully");
        fetchOrders();
        closeDialog();
      }
    } else {
      const { error } = await supabase.from("orders").insert(orderData);

      if (error) {
        toast.error("Failed to create order");
      } else {
        toast.success("Order created successfully");
        fetchOrders();
        closeDialog();
      }
    }
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      customer_name: order.customer_name,
      customer_email: order.customer_email || "",
      customer_phone: order.customer_phone,
      cake_type: order.cake_type,
      event_type: order.event_type || "",
      event_date: order.event_date,
      servings: order.servings?.toString() || "",
      order_notes: order.order_notes || "",
      deposit_amount: order.deposit_amount.toString(),
      total_amount: order.total_amount.toString(),
      status: order.status,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      cake_type: "",
      event_type: "",
      event_date: "",
      servings: "",
      order_notes: "",
      deposit_amount: "",
      total_amount: "",
      status: "pending",
    });
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    try {
      // Delete related records first (vision images, supplies, payments)
      await supabase.from("order_vision_images").delete().eq("order_id", orderToDelete.id);
      await supabase.from("order_supplies").delete().eq("order_id", orderToDelete.id);
      await supabase.from("payments").delete().eq("order_id", orderToDelete.id);
      
      // Delete the order
      const { error } = await supabase.from("orders").delete().eq("id", orderToDelete.id);
      
      if (error) throw error;
      
      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cake_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "delivered": return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Orders</h1>
            <p className="text-muted-foreground mt-1">Manage your cake orders</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-popover">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {selectedOrder ? "Edit Order" : "Create New Order"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cake Type *</Label>
                    <Select
                      value={formData.cake_type}
                      onValueChange={(v) => setFormData({ ...formData, cake_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {cakeTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Input
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      placeholder="e.g., Birthday, Wedding"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Event Date *</Label>
                    <Input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {statusOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Order Notes</Label>
                  <Textarea
                    value={formData.order_notes}
                    onChange={(e) => setFormData({ ...formData, order_notes: e.target.value })}
                    rows={3}
                    placeholder="Special instructions, design details, etc."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    {selectedOrder ? "Update Order" : "Create Order"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              No orders found. Create your first order to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-medium transition-shadow cursor-pointer"
                onClick={() => openEditDialog(order)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status.replace("_", " ")}
                        </Badge>
                        {getOrderVisionImages(order.id).length > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {getOrderVisionImages(order.id).length}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{order.cake_type}</p>
                      {order.customer_phone && (
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      )}
                      
                      {/* Vision Board Preview */}
                      {getOrderVisionImages(order.id).length > 0 && (
                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                          {getOrderVisionImages(order.id).map((img) => (
                            <img
                              key={img.id}
                              src={img.image_url}
                              alt="Vision"
                              className="w-12 h-12 object-cover rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                              onClick={() => setSelectedImage(img.image_url)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(order.event_date), "MMM d, yyyy")}
                        </div>
                        <div className="font-semibold text-lg mt-1">
                          ${Number(order.total_amount).toFixed(2)}
                        </div>
                        {order.deposit_amount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Deposit: ${Number(order.deposit_amount).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order);
                          }}
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
        )}

        {/* Image Preview Dialog */}
        <ImageDialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <ImageDialogContent className="max-w-3xl p-2 bg-background">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Vision Board"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </ImageDialogContent>
        </ImageDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the order for <strong>{orderToDelete?.customer_name}</strong>? 
                This will also delete all associated payments and images. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Order"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
