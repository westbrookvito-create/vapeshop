import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getTelegram } from "./lib/telegram";
import { api } from "./lib/api";
import { useSession } from "./store/session";
import BottomNav from "./components/BottomNav";
import AgeGate from "./components/AgeGate";
import ToastHost from "./components/ToastHost";
import SplashScreen from "./components/SplashScreen";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminProductEdit from "./pages/admin/ProductEdit";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetail from "./pages/admin/OrderDetail";
import AdminMore from "./pages/admin/More";
import AdminCategories from "./pages/admin/Categories";
import AdminPromo from "./pages/admin/Promo";
import AdminCustomers from "./pages/admin/Customers";
import AdminSettings from "./pages/admin/Settings";

export default function App() {
  const location = useLocation();
  const { isAdmin, loading, setSession } = useSession();
  const [ageOk, setAgeOk] = useState(() => localStorage.getItem("vapeshop-age-ok") === "1");

  useEffect(() => {
    const tg = getTelegram();
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor("#0a0a12");
      tg.setBackgroundColor("#0a0a12");
    } catch {
      /* older client */
    }

    const theme = tg.colorScheme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);

    api.auth
      .verify()
      .then((res) => setSession(res.user, res.isAdmin))
      .catch(() => setSession({ telegramId: 0, firstName: "Гость", lastName: "", username: "", bonusPoints: 0 }, false));
  }, [setSession]);

  const inAdmin = location.pathname.startsWith("/admin");

  if (loading) return <SplashScreen />;
  if (!ageOk) return <AgeGate onConfirm={() => { localStorage.setItem("vapeshop-age-ok", "1"); setAgeOk(true); }} />;

  return (
    <>
      <div className="app-bg" />
      <ToastHost />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />

            {isAdmin && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/new" element={<AdminProductEdit />} />
                <Route path="/admin/products/:id" element={<AdminProductEdit />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                <Route path="/admin/more" element={<AdminMore />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/promo" element={<AdminPromo />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </>
            )}
          </Routes>
        </motion.div>
      </AnimatePresence>
      <BottomNav mode={inAdmin && isAdmin ? "admin" : "shop"} />
    </>
  );
}
