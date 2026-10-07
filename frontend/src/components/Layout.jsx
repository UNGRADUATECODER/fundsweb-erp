import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  ShoppingCart,
  Package,
  Truck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Enquiries", path: "/enquiries", icon: MessageSquare },
  { name: "Quotations", path: "/quotations", icon: FileText },
  { name: "Sales Orders", path: "/sales-orders", icon: ShoppingCart },
  { name: "Inventory", path: "/inventory", icon: Package },
  { name: "Dispatch", path: "/dispatches", icon: Truck },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            FundsWeb ERP
          </h1>

          <p className="text-[11px] text-slate-500">
            Sales Management
          </p>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-white transition-transform duration-200 lg:w-64 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">

          {/* Logo */}
          <div className="flex h-20 items-center border-b border-slate-700 px-6">
            <div>
              <h1 className="text-xl font-bold">
                FundsWeb ERP
              </h1>

              <p className="mt-1 text-xs text-slate-400">
                Sales Management System
              </p>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Main Menu
            </p>

            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={19} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* User */}
          <div className="border-t border-slate-700 p-4">

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user.name || "User"}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {user.role || "SALES_USER"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <div className="w-full p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}

export default Layout;