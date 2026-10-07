import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SalesOrders from "./pages/SalesOrders";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Enquiries from "./pages/Enquiries";
import Quotations from "./pages/Quotations";
import Inventory from "./pages/Inventory";
import Dispatches from "./pages/Dispatches";
import Register from "./pages/Register";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      

      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/sales-orders"
  element={
    <ProtectedRoute>
      <SalesOrders />
    </ProtectedRoute>
  }
/>
<Route
  path="/inventory"
  element={
    <ProtectedRoute>
      <Inventory />
    </ProtectedRoute>
  }
/>
<Route
  path="/dispatches"
  element={
    <ProtectedRoute>
      <Dispatches/>
    </ProtectedRoute>
  }
/>
        
        <Route
  path="/quotations"
  element={
    <ProtectedRoute>
      <Quotations/>
    </ProtectedRoute>
  }
/>

        {/* Customers */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />

        {/* Enquiries */}
        <Route
          path="/enquiries"
          element={
            <ProtectedRoute>
              <Enquiries />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;