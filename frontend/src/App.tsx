import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { verifyAdminAuth } from "./lib/api";

// Public Pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import AddressManagement from "./pages/AddressManagement";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GoldPrices from "./pages/GoldPrices";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsList from "./pages/admin/ProductsList";
import ProductForm from "./pages/admin/ProductForm";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import CustomersManagement from "./pages/admin/CustomersManagement";
import SiteContentManagement from "./pages/admin/SiteContentManagement";
import SocialMediaManagement from "./pages/admin/SocialMediaManagement";
import InquiriesManagement from "./pages/admin/InquiriesManagement";
import AdminGoldPrices from "./pages/admin/AdminGoldPrices";

const queryClient = new QueryClient();

// Protected route component for admin routes
const ProtectedAdminRoute = () => {
  // Check if admin is authenticated
  const isAuthenticated = verifyAdminAuth();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // If authenticated, render the AdminLayout with nested routes
  return <AdminLayout />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/addresses" element={<AddressManagement />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/gold-prices" element={<GoldPrices />} />
                </Route>

                {/* Admin Login Page (Unprotected) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={<ProtectedAdminRoute />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<ProductsList />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:productId" element={<ProductForm />} />
                  <Route path="categories" element={<CategoriesManagement />} />
                  <Route path="orders" element={<OrdersManagement />} />
                  <Route path="customers" element={<CustomersManagement />} />
                  <Route path="site-content" element={<SiteContentManagement />} />
                  <Route path="social-media-links" element={<SocialMediaManagement />} />
                  <Route path="inquiries" element={<InquiriesManagement />} />
                  <Route path="gold-prices" element={<AdminGoldPrices />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
