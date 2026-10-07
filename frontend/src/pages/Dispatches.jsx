import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Truck, RefreshCw } from "lucide-react";

import Layout from "../components/Layout";
import { apiRequest } from "../services/api";

function Dispatches() {
  const [dispatches, setDispatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [orderId, setOrderId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [dispatchData, orderData] = await Promise.all([
        apiRequest("/dispatches"),
        apiRequest("/sales-orders"),
      ]);

      setDispatches(dispatchData.dispatches || []);
      setOrders(orderData.orders || []);
    } catch (error) {
      toast.error(error.message || "Unable to load dispatches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createDispatch = async () => {
    if (!orderId) {
      toast.error("Please select a sales order");
      return;
    }

    try {
      setCreating(true);

      await apiRequest("/dispatches", {
        method: "POST",
        body: JSON.stringify({
          salesOrderId: Number(orderId),
        }),
      });

      toast.success("Order dispatched successfully");

      setOrderId("");
      loadData();
    } catch (error) {
      toast.error(error.message || "Unable to dispatch order");
    } finally {
      setCreating(false);
    }
  };

  const dispatchableOrders = orders.filter(
    (order) => order.status !== "DISPATCHED" && order.status !== "CANCELLED"
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
              Dispatch
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Dispatch sales orders and update inventory.
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
            Create Dispatch
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Select a sales order to complete dispatch.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select sales order</option>

              {dispatchableOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  Order #{order.id} - {order.customer?.name || "Customer"} - ₹
                  {order.totalAmount}
                </option>
              ))}
            </select>

            <button
              onClick={createDispatch}
              disabled={creating}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Dispatching..." : "Dispatch Order"}
            </button>
          </div>

          {dispatchableOrders.length === 0 && (
            <p className="mt-3 text-xs text-amber-600">
              No dispatchable sales orders available.
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <Truck size={20} className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Dispatch List
                </h3>

                <p className="text-xs text-slate-500">
                  {dispatches.length} dispatch
                  {dispatches.length !== 1 ? "es" : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading dispatches...
            </div>
          ) : dispatches.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No dispatches found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Dispatch</th>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {dispatches.map((dispatch) => (
                    <tr
                      key={dispatch.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        #{dispatch.id}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        #{dispatch.salesOrderId}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {dispatch.salesOrder?.customer?.name || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          {dispatch.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {dispatch.dispatchedAt
                          ? new Date(dispatch.dispatchedAt).toLocaleString()
                          : "-"}
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

export default Dispatches;