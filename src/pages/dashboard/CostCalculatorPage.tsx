import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calculator, Plus, Trash2, DollarSign, TrendingUp, Package } from "lucide-react";

interface Supply {
  id: string;
  name: string;
  unit: string;
  unit_price: number;
  category: string;
}

interface Order {
  id: string;
  customer_name: string;
  cake_type: string;
  event_date: string;
  total_amount: number | null;
}

interface OrderSupply {
  id: string;
  order_id: string;
  supply_id: string;
  quantity_used: number;
  cost: number | null;
  supply?: Supply;
}

export default function CostCalculatorPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [orderSupplies, setOrderSupplies] = useState<OrderSupply[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [addSupplyForm, setAddSupplyForm] = useState({
    supply_id: "",
    quantity_used: "",
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    
    const [ordersRes, suppliesRes, orderSuppliesRes] = await Promise.all([
      supabase.from("orders").select("id, customer_name, cake_type, event_date, total_amount").order("event_date", { ascending: false }),
      supabase.from("supplies").select("*"),
      supabase.from("order_supplies").select("*"),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (suppliesRes.data) setSupplies(suppliesRes.data);
    if (orderSuppliesRes.data) setOrderSupplies(orderSuppliesRes.data);
    
    setLoading(false);
  };

  const getOrderCosts = (orderId: string) => {
    return orderSupplies.filter((os) => os.order_id === orderId);
  };

  const calculateTotalCost = (orderId: string) => {
    const costs = getOrderCosts(orderId);
    return costs.reduce((sum, os) => sum + (os.cost || 0), 0);
  };

  const calculateProfit = (order: Order) => {
    const revenue = order.total_amount || 0;
    const cost = calculateTotalCost(order.id);
    return revenue - cost;
  };

  const calculateMargin = (order: Order) => {
    const revenue = order.total_amount || 0;
    if (revenue === 0) return 0;
    const profit = calculateProfit(order);
    return (profit / revenue) * 100;
  };

  const handleAddSupply = async () => {
    if (!selectedOrder || !addSupplyForm.supply_id || !addSupplyForm.quantity_used) {
      toast.error("Please select a supply and enter quantity");
      return;
    }

    const supply = supplies.find((s) => s.id === addSupplyForm.supply_id);
    if (!supply) return;

    const quantity = parseFloat(addSupplyForm.quantity_used);
    const cost = quantity * supply.unit_price;

    const { error } = await supabase.from("order_supplies").insert({
      order_id: selectedOrder.id,
      supply_id: addSupplyForm.supply_id,
      quantity_used: quantity,
      cost: cost,
      user_id: user!.id,
    });

    if (error) {
      toast.error("Failed to add supply");
      console.error(error);
    } else {
      toast.success("Supply added to order");
      setAddSupplyForm({ supply_id: "", quantity_used: "" });
      fetchData();
    }
  };

  const handleRemoveSupply = async (orderSupplyId: string) => {
    const { error } = await supabase
      .from("order_supplies")
      .delete()
      .eq("id", orderSupplyId);

    if (error) {
      toast.error("Failed to remove supply");
    } else {
      toast.success("Supply removed");
      fetchData();
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const getSupplyById = (supplyId: string) => {
    return supplies.find((s) => s.id === supplyId);
  };

  // Calculate overall stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalCosts = orders.reduce((sum, o) => sum + calculateTotalCost(o.id), 0);
  const totalProfit = totalRevenue - totalCosts;
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-semibold">Cost Calculator</h1>
          <p className="text-muted-foreground">
            Track ingredient costs per order to understand profit margins
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Costs
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ${totalCosts.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Profit
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
                ${totalProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Margin
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${avgMargin >= 0 ? "text-green-600" : "text-destructive"}`}>
                {avgMargin.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No orders found. Create orders first to track costs.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Order Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cake Type</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Costs</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const cost = calculateTotalCost(order.id);
                    const profit = calculateProfit(order);
                    const margin = calculateMargin(order);
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.customer_name}</TableCell>
                        <TableCell>{order.cake_type}</TableCell>
                        <TableCell>{format(new Date(order.event_date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          ${(order.total_amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          ${cost.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right ${profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                          ${profit.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right ${margin >= 0 ? "text-green-600" : "text-destructive"}`}>
                          {margin.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openOrderDetail(order)}
                          >
                            <Calculator className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-popover">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Cost Breakdown: {selectedOrder?.customer_name}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Cake Type</p>
                    <p className="font-medium">{selectedOrder.cake_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedOrder.event_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-medium text-lg">
                      ${(selectedOrder.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className={`font-medium text-lg ${calculateMargin(selectedOrder) >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {calculateMargin(selectedOrder).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Add Supply */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Add Supply Cost</Label>
                  <div className="flex gap-3">
                    <Select
                      value={addSupplyForm.supply_id}
                      onValueChange={(v) => setAddSupplyForm({ ...addSupplyForm, supply_id: v })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select supply" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {supplies.map((supply) => (
                          <SelectItem key={supply.id} value={supply.id}>
                            {supply.name} (${supply.unit_price.toFixed(2)}/{supply.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Quantity"
                      className="w-24"
                      value={addSupplyForm.quantity_used}
                      onChange={(e) => setAddSupplyForm({ ...addSupplyForm, quantity_used: e.target.value })}
                    />
                    <Button onClick={handleAddSupply}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Supplies List */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Supplies Used</Label>
                  {getOrderCosts(selectedOrder.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No supplies added yet
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supply</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getOrderCosts(selectedOrder.id).map((os) => {
                          const supply = getSupplyById(os.supply_id);
                          return (
                            <TableRow key={os.id}>
                              <TableCell>{supply?.name || "Unknown"}</TableCell>
                              <TableCell className="text-right">
                                {os.quantity_used} {supply?.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                ${supply?.unit_price.toFixed(2) || "0.00"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${(os.cost || 0).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveSupply(os.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={3} className="font-medium">
                            Total Cost
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${calculateTotalCost(selectedOrder.id).toFixed(2)}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
