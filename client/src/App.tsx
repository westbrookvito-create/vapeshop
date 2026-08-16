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

import Assortment from "./pages/Assortment";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Bonuses from "./pages/Bonuses";

export default function App() {
  const location = useLocation();
  const { loading, setSession } = useSession();
  const [ageOk, setAgeOk] = useState(() => localStorage.getItem("vapeshop-age-ok") === "1");

  useEffect(() => {
    const tg = getTelegram();
    tg.ready();
    tg.expand();
    try {
      tg.setHeaderColor("#ffffff");
      tg.setBackgroundColor("#ffffff");
    } catch {
      /* older client */
    }

    document.documentElement.setAttribute("data-theme", "light");

    api.auth
      .verify()
      .then((res) => setSession(res.user, res.isAdmin))
      .catch(() => setSession({ telegramId: 0, firstName: "Гость", lastName: "", username: "", bonusPoints: 0 }, false));
  }, [setSession]);

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
            <Route path="/" element={<Assortment />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bonuses" element={<Bonuses />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </>
  );
}
