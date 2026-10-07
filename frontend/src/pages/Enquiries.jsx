import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, RefreshCw, MessageSquare } from "lucide-react";

import Layout from "../components/Layout";
import { apiRequest } from "../services/api";

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    customerId: "",
    subject: "",
    productId: "",
    quantity: 1,
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [enquiryData, customerData, productData] = await Promise.all([
        apiRequest("/enquiries"),
        apiRequest("/customers"),
        apiRequest("/products"),
      ]);

      setEnquiries(enquiryData.enquiries || []);
      setCustomers(customerData.customers || []);
      setProducts(productData.products || []);
    } catch (error) {
      toast.error(error.message || "Unable to load enquiries");
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

    if (!form.customerId || !form.productId || !form.quantity) {
      toast.error("Customer, product and quantity are required");
      return;
    }

    try {
      await apiRequest("/enquiries", {
        method: "POST",
        body: JSON.stringify({
          customerId: Number(form.customerId),
          subject: form.subject,
          items: [
            {
              productId: Number(form.productId),
              quantity: Number(form.quantity),
            },
          ],
        }),
      });

      toast.success("Enquiry created successfully");

      setForm({
        customerId: "",
        subject: "",
        productId: "",
        quantity: 1,
      });

      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error(error.message || "Unable to create enquiry");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Sales Workflow</p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Customer Enquiries
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage customer product enquiries.
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
              New Enquiry
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Create Enquiry
            </h3>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select Customer</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>

              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Enquiry subject"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select Product</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>

              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create Enquiry
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

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <MessageSquare size={20} className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Enquiry List
                </h3>

                <p className="text-xs text-slate-500">
                  {enquiries.length} enquiry
                  {enquiries.length !== 1 ? "ies" : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading enquiries...
            </div>
          ) : enquiries.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No enquiries found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {enquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        #{enquiry.id}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {enquiry.customer?.name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {enquiry.subject || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {enquiry.items?.length || 0}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {enquiry.status}
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

export default Enquiries;