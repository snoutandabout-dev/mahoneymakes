import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/dashboard/OrdersPage";
import RequestsPage from "./pages/dashboard/RequestsPage";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import SuppliesPage from "./pages/dashboard/SuppliesPage";
import InventoryPage from "./pages/dashboard/InventoryPage";
import SpecialsPage from "./pages/dashboard/SpecialsPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import UsersPage from "./pages/dashboard/UsersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/dashboard/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/dashboard/supplies" element={<ProtectedRoute><SuppliesPage /></ProtectedRoute>} />
            <Route path="/dashboard/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/dashboard/specials" element={<ProtectedRoute><SpecialsPage /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/dashboard/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
