import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  MessageSquare,
  FileText,
  ShoppingCart,
  Package,
  Truck,
  RefreshCw,
} from "lucide-react";

import Layout from "../components/Layout";
import { apiRequest } from "../services/api";

const cards = [
  {
    key: "customers",
    title: "Customers",
    description: "Total customers",
    icon: Users,
  },
  {
    key: "enquiries",
    title: "Enquiries",
    description: "Customer enquiries",
    icon: MessageSquare,
  },
  {
    key: "quotations",
    title: "Quotations",
    description: "Created quotations",
    icon: FileText,
  },
  {
    key: "orders",
    title: "Sales Orders",
    description: "Sales orders",
    icon: ShoppingCart,
  },
  {
    key: "inventory",
    title: "Inventory",
    description: "Available products",
    icon: Package,
  },
  {
    key: "dispatches",
    title: "Dispatches",
    description: "Order dispatches",
    icon: Truck,
  },
];

function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    enquiries: 0,
    quotations: 0,
    orders: 0,
    inventory: 0,
    dispatches: 0,
  });

  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadStats = async () => {
    try {
      setLoading(true);

      const [
        customers,
        enquiries,
        quotations,
        orders,
        products,
        dispatches,
      ] = await Promise.all([
        apiRequest("/customers"),
        apiRequest("/enquiries"),
        apiRequest("/quotations"),
        apiRequest("/sales-orders"),
        apiRequest("/products"),
        apiRequest("/dispatches"),
      ]);

      setStats({
        customers: customers.customers?.length || 0,
        enquiries: enquiries.enquiries?.length || 0,
        quotations: quotations.quotations?.length || 0,
        orders: orders.orders?.length || 0,
        inventory: products.products?.length || 0,
        dispatches: dispatches.dispatches?.length || 0,
      });
    } catch (error) {
      toast.error(error.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Overview
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Welcome back, {user.name || "User"}
            </p>
          </div>

          <button
            onClick={loadStats}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-800">
                      {loading ? "—" : stats[card.key]}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {card.description}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3">
                    <Icon
                      size={21}
                      className="text-blue-600"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-slate-800">
            Sales Workflow
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Manage the complete customer-to-dispatch process.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Customer Enquiry",
              "Quotation",
              "Sales Order",
              "Inventory",
              "Dispatch",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-lg border border-slate-200 p-4"
              >
                <span className="text-xs font-semibold text-blue-600">
                  STEP {index + 1}
                </span>

                <p className="mt-2 text-sm font-medium text-slate-700">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;