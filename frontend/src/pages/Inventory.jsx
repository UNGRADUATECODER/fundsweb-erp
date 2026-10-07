import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Package, RefreshCw } from "lucide-react";

import Layout from "../components/Layout";
import { apiRequest } from "../services/api";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/products");

      setProducts(data.products || []);
    } catch (error) {
      toast.error(error.message || "Unable to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Inventory Management
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Inventory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor physical and reserved stock.
            </p>
          </div>

          <button
            onClick={loadProducts}
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

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <Package size={20} className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Product Inventory
                </h3>

                <p className="text-xs text-slate-500">
                  {products.length} product
                  {products.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading inventory...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Unit Price</th>
                    <th className="px-5 py-3">Physical Qty</th>
                    <th className="px-5 py-3">Reserved Qty</th>
                    <th className="px-5 py-3">Available Qty</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const physical = Number(product.physicalQty || 0);
                    const reserved = Number(product.reservedQty || 0);
                    const available = physical - reserved;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {product.sku}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {product.name}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          ₹{product.unitPrice}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {physical}
                        </td>

                        <td className="px-5 py-4 text-amber-600">
                          {reserved}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              available > 0
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {available}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Inventory;