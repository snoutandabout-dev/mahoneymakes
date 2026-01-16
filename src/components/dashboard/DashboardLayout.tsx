import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Inbox,
  DollarSign,
  Package,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Settings,
  Calculator,
  ShoppingCart,
  Warehouse,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/mahoney-makes-logo.png";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface NavGroup {
  icon: React.ElementType;
  label: string;
  items: NavItem[];
}

type SidebarItem = NavItem | NavGroup;

const isNavGroup = (item: SidebarItem): item is NavGroup => {
  return "items" in item;
};

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    icon: ShoppingCart,
    label: "Orders",
    items: [
      { icon: Inbox, label: "Requests", href: "/dashboard/requests" },
      { icon: ClipboardList, label: "Orders", href: "/dashboard/orders" },
      { icon: DollarSign, label: "Payments", href: "/dashboard/payments" },
    ],
  },
  {
    icon: Warehouse,
    label: "Inventory",
    items: [
      { icon: Package, label: "Supplies", href: "/dashboard/supplies" },
      { icon: ClipboardCheck, label: "Checklist", href: "/dashboard/inventory" },
    ],
  },
  { icon: Sparkles, label: "Specials", href: "/dashboard/specials" },
  {
    icon: PieChart,
    label: "Financials",
    items: [
      { icon: Calculator, label: "Cost Calculator", href: "/dashboard/costs" },
      { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
    ],
  },
  { icon: Users, label: "Team", href: "/dashboard/users" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Auto-expand groups that contain the current route
  const getInitialExpandedGroups = () => {
    const expanded: string[] = [];
    sidebarItems.forEach((item) => {
      if (isNavGroup(item)) {
        const hasActiveChild = item.items.some(
          (child) => location.pathname === child.href
        );
        if (hasActiveChild && !expanded.includes(item.label)) {
          expanded.push(item.label);
        }
      }
    });
    return expanded;
  };

  // Initialize expanded groups based on current route
  useState(() => {
    const initial = getInitialExpandedGroups();
    if (initial.length > 0) {
      setExpandedGroups(initial);
    }
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((g) => g !== label)
        : [...prev, label]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => location.pathname === item.href);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center">
              <img src={logo} alt="Mahoney Makes" className="h-20 w-auto" />
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Baker Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              if (isNavGroup(item)) {
                const isExpanded = expandedGroups.includes(item.label);
                const isActive = isGroupActive(item);

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleGroup(item.label)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                        {item.items.map((subItem) => {
                          const isSubActive = location.pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.href}
                              to={subItem.href}
                              onClick={() => setIsSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                                isSubActive
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent"
                              )}
                            >
                              <subItem.icon className="h-4 w-4" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">View Website</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-foreground hover:bg-muted rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <img src={logo} alt="Mahoney Makes" className="h-12 w-auto" />
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
