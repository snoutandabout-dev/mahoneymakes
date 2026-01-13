import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, TrendingUp, TrendingDown, Cake, BarChart3 } from "lucide-react";

interface ReportData {
  monthlyIncome: number;
  monthlyExpenses: number;
  netProfit: number;
  totalOrders: number;
  popularCakes: { cake_type: string; count: number }[];
}

const ReportsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ReportData>({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    totalOrders: 0,
    popularCakes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchReportData();
  }, [user]);

  const fetchReportData = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startDate = startOfMonth.toISOString().split("T")[0];

    // Fetch monthly income from payments
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .gte("payment_date", startDate);
    const monthlyIncome = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Fetch monthly orders count
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    // Calculate estimated expenses (simple approximation based on supplies)
    const { data: supplies } = await supabase
      .from("supplies")
      .select("unit_price, current_stock");
    
    // Rough estimate: assume 30% of income goes to supplies
    const monthlyExpenses = monthlyIncome * 0.3;

    // Fetch popular cakes
    const { data: orders } = await supabase
      .from("orders")
      .select("cake_type");

    const cakeCounts: Record<string, number> = {};
    orders?.forEach((order) => {
      cakeCounts[order.cake_type] = (cakeCounts[order.cake_type] || 0) + 1;
    });

    const popularCakes = Object.entries(cakeCounts)
      .map(([cake_type, count]) => ({ cake_type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setData({
      monthlyIncome,
      monthlyExpenses,
      netProfit: monthlyIncome - monthlyExpenses,
      totalOrders: totalOrders || 0,
      popularCakes,
    });
    setLoading(false);
  };

  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Reports</h1>
          <p className="text-muted-foreground mt-1">Summary for {currentMonth}</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">
                    Monthly Income
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800">
                    ${data.monthlyIncome.toFixed(2)}
                  </div>
                  <p className="text-xs text-green-600 mt-1">Total payments received</p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">
                    Est. Expenses
                  </CardTitle>
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-800">
                    ${data.monthlyExpenses.toFixed(2)}
                  </div>
                  <p className="text-xs text-red-600 mt-1">~30% of income for supplies</p>
                </CardContent>
              </Card>

              <Card className={data.netProfit >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">
                    Net Profit
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800">
                    ${data.netProfit.toFixed(2)}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Income minus expenses</p>
                </CardContent>
              </Card>
            </div>

            {/* Orders Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-xl">Orders This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{data.totalOrders}</div>
                <p className="text-muted-foreground mt-1">Total orders placed</p>
              </CardContent>
            </Card>

            {/* Popular Cakes */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Cake className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-xl">Most Popular Cakes</CardTitle>
              </CardHeader>
              <CardContent>
                {data.popularCakes.length === 0 ? (
                  <p className="text-muted-foreground">No orders yet to analyze.</p>
                ) : (
                  <div className="space-y-4">
                    {data.popularCakes.map((cake, index) => (
                      <div key={cake.cake_type} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{cake.cake_type}</span>
                            <span className="text-muted-foreground">{cake.count} orders</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${(cake.count / data.popularCakes[0].count) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
