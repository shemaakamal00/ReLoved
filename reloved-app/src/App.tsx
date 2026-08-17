import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ToastProvider } from "./context/ToastContext";
import About from "./pages/About";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import Favorites from "./pages/Favorites";
import Footer from "./components/Footer";
import ForgotPassword from "./pages/ForgotPassword";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import RequireAdmin from "./components/RequireAdmin";
import RequireAuth from "./components/RequireAuth";
import SellerDashboard from "./pages/seller/SellerDashboard";
import TermsOfService from "./pages/TermsOfService";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <Header />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route
                  path="/orders"
                  element={
                    <RequireAuth>
                      <Orders />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <RequireAuth>
                      <OrderDetail />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminDashboard />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/seller"
                  element={
                    <RequireAuth>
                      <SellerDashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<NotFound />} />
              </Routes>

              <Footer />
            </BrowserRouter>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
