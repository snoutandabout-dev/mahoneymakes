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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, DollarSign, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  notes: string | null;
  payment_date: string;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  cake_type: string;
  total_amount: number;
}

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "zelle", label: "Zelle" },
  { value: "paypal", label: "PayPal" },
  { value: "cashapp", label: "Cash App" },
  { value: "venmo", label: "Venmo" },
  { value: "check", label: "Check" },
  { value: "other", label: "Other" },
];

const paymentTypes = [
  { value: "deposit", label: "Deposit" },
  { value: "partial", label: "Partial Payment" },
  { value: "final_payment", label: "Final Payment" },
];

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    order_id: "",
    amount: "",
    payment_type: "deposit",
    payment_method: "cash",
    notes: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    if (user) {
      fetchPayments();
      fetchOrders();
    }
  }, [user]);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false });

    if (!error) setPayments(data || []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, customer_name, cake_type, total_amount")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("payments").insert({
      user_id: user!.id,
      order_id: formData.order_id,
      amount: parseFloat(formData.amount),
      payment_type: formData.payment_type,
      payment_method: formData.payment_method,
      notes: formData.notes || null,
      payment_date: formData.payment_date,
    });

    if (error) {
      toast.error("Failed to record payment");
    } else {
      toast.success("Payment recorded successfully");
      fetchPayments();
      setIsDialogOpen(false);
      setFormData({
        order_id: "",
        amount: "",
        payment_type: "deposit",
        payment_method: "cash",
        notes: "",
        payment_date: format(new Date(), "yyyy-MM-dd"),
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    const { error } = await supabase.from("payments").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete payment");
    } else {
      toast.success("Payment deleted");
      fetchPayments();
    }
  };

  const getOrderInfo = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Payments</h1>
            <p className="text-muted-foreground mt-1">Track deposits and final payments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-popover">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Record Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Order *</Label>
                  <Select
                    value={formData.order_id}
                    onValueChange={(v) => setFormData({ ...formData, order_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.customer_name} - {order.cake_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <Select
                      value={formData.payment_type}
                      onValueChange={(v) => setFormData({ ...formData, payment_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {paymentTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {paymentMethods.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">Record Payment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">Total Received</p>
                <p className="text-3xl font-bold text-green-800">${totalReceived.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : payments.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center text-muted-foreground">
              No payments recorded yet. Record your first payment to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => {
              const order = getOrderInfo(payment.order_id);
              return (
                <Card key={payment.id} className="hover:shadow-soft transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{order?.customer_name || "Unknown Order"}</p>
                        <p className="text-sm text-muted-foreground">{order?.cake_type}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                            {payment.payment_type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            via {payment.payment_method}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg text-green-600">
                            +${Number(payment.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.payment_date), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(payment.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
