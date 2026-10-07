import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Users, RefreshCw } from "lucide-react";

import Layout from "../components/Layout";
import { apiRequest } from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/customers");

      setCustomers(data.customers || []);
    } catch (error) {
      toast.error(error.message || "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.address) {
      toast.error("Name, phone and address are required");
      return;
    }

    try {
      await apiRequest("/customers", {
        method: "POST",
        body: JSON.stringify(form),
      });

      toast.success("Customer created successfully");

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
      });

      setShowForm(false);
      loadCustomers();
    } catch (error) {
      toast.error(error.message || "Unable to create customer");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Management
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-800">
              Customers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your customer records.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadCustomers}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Customer
            </button>
          </div>
        </div>

        {/* Add Customer Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Add Customer
            </h3>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Customer name"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save Customer
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

        {/* Customer List */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <Users size={20} className="text-blue-600" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Customer List
                </h3>

                <p className="text-xs text-slate-500">
                  {customers.length} customer
                  {customers.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No customers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Address</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {customer.name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {customer.email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {customer.phone}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {customer.address}
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

export default Customers;