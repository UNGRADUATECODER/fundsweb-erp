import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, RefreshCw, FileText } from "lucide-react";

import Layout from "../components/Layout";
import { apiRequest } from "../services/api";

function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    enquiryId: "",
    productId: "",
    quantity: 1,
    discount: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [quotationData, enquiryData, productData] = await Promise.all([
        apiRequest("/quotations"),
        apiRequest("/enquiries"),
        apiRequest("/products"),
      ]);

      setQuotations(quotationData.quotations || []);
      setEnquiries(enquiryData.enquiries || []);
      setProducts(productData.products || []);
    } catch (error) {
      toast.error(error.message || "Unable to load quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.enquiryId || !form.productId || !form.quantity) {
      toast.error("Enquiry, product and quantity are required");
      return;
    }

    try {
      await apiRequest("/quotations", {
        method: "POST",
        body: JSON.stringify({
          enquiryId: Number(form.enquiryId),
          discount: Number(form.discount || 0),
          items: [
            {
              productId: Number(form.productId),
              quantity: Number(form.quantity),
            },
          ],
        }),
      });

      toast.success("Quotation created successfully");

      setForm({
        enquiryId: "",
        productId: "",
        quantity: 1,
        discount: 0,
      });

      setShowForm(false);

      loadData();
    } catch (error) {
      toast.error(error.message || "Unable to create quotation");
    }
  };

  // Accept quotation
  const handleAccept = async (quotationId) => {
    try {
      await apiRequest(`/quotations/${quotationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "ACCEPTED",
        }),
      });

      toast.success("Quotation accepted successfully");

      loadData();
    } catch (error) {
      toast.error(error.message || "Unable to accept quotation");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Sales Workflow
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Quotations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create quotations with server-side GST and discount calculation.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              New Quotation
            </button>
          </div>
        </div>

        {/* Create quotation form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Create Quotation
            </h3>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              {/* Enquiry */}
              <select
                name="enquiryId"
                value={form.enquiryId}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select Enquiry</option>

                {enquiries.map((enquiry) => (
                  <option key={enquiry.id} value={enquiry.id}>
                    #{enquiry.id} - {enquiry.customer?.name || "Customer"}
                  </option>
                ))}
              </select>

              {/* Product */}
              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select Product</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₹{product.unitPrice}
                  </option>
                ))}
              </select>

              {/* Quantity */}
              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* Discount */}
              <input
                name="discount"
                type="number"
                min="0"
                value={form.discount}
                onChange={handleChange}
                placeholder="Discount"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 sm:col-span-2">
                GST and final quotation total are calculated by the backend.
              </div>

              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create Quotation
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Quotation table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <FileText size={20} className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Quotation List
                </h3>

                <p className="text-xs text-slate-500">
                  {quotations.length} quotation
                  {quotations.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading quotations...
            </div>
          ) : quotations.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No quotations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Enquiry</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Subtotal</th>
                    <th className="px-5 py-3">GST</th>
                    <th className="px-5 py-3">Discount</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {quotations.map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        #{quotation.id}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        #{quotation.enquiryId}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {quotation.enquiry?.customer?.name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        ₹{quotation.subtotal}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        ₹{quotation.gstAmount}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        ₹{quotation.discount}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        ₹{quotation.totalAmount || quotation.total}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            quotation.status === "ACCEPTED"
                              ? "bg-green-50 text-green-700"
                              : quotation.status === "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : quotation.status === "SENT"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {quotation.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        {(quotation.status === "DRAFT" ||
                          quotation.status === "SENT") && (
                          <button
                            onClick={() => handleAccept(quotation.id)}
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Accept
                          </button>
                        )}

                        {quotation.status === "ACCEPTED" && (
                          <span className="text-xs font-semibold text-green-600">
                            Accepted
                          </span>
                        )}

                        {quotation.status === "REJECTED" && (
                          <span className="text-xs font-semibold text-red-600">
                            Rejected
                          </span>
                        )}
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

export default Quotations;