import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, RefreshCw } from "lucide-react";

import Layout from "../components/Layout";
import { apiRequest } from "../services/api";

function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [quotationId, setQuotationId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [orderData, quotationData] = await Promise.all([
        apiRequest("/sales-orders"),
        apiRequest("/quotations"),
      ]);

      setOrders(orderData.orders || []);
      setQuotations(quotationData.quotations || []);
    } catch (error) {
      toast.error(error.message || "Unable to load sales orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createOrder = async () => {
    if (!quotationId) {
      toast.error("Please select an accepted quotation");
      return;
    }

    try {
      setCreating(true);

      await apiRequest("/sales-orders", {
        method: "POST",
        body: JSON.stringify({
          quotationId: Number(quotationId),
        }),
      });

      toast.success("Sales order created and inventory reserved");

      setQuotationId("");
      loadData();
    } catch (error) {
      toast.error(error.message || "Unable to create sales order");
    } finally {
      setCreating(false);
    }
  };

const acceptedQuotations = quotations.filter(
  (quotation) => String(quotation.status).trim().toUpperCase() === "ACCEPTED"
);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Sales Workflow
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Sales Orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Convert accepted quotations into sales orders.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-slate-800">
            Create Sales Order
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Only accepted quotations can be converted.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <select
              value={quotationId}
              onChange={(e) => setQuotationId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select accepted quotation</option>

              {acceptedQuotations.map((quotation) => (
                <option key={quotation.id} value={quotation.id}>
                  Quotation #{quotation.id} - ₹{quotation.totalAmount}
                </option>
              ))}
            </select>

            <button
              onClick={createOrder}
              disabled={creating}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Sales Order"}
            </button>
          </div>

          {acceptedQuotations.length === 0 && (
            <p className="mt-3 text-xs text-amber-600">
              No accepted quotations available.
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <ShoppingCart size={20} className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Sales Order List
                </h3>

                <p className="text-xs text-slate-500">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading sales orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No sales orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Quotation</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-800">
                        #{order.id}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {order.customer?.name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        #{order.quotationId}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        ₹{order.totalAmount}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default SalesOrders;