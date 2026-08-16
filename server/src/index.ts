import "dotenv/config";
import express from "express";
import cors from "cors";
import { telegramAuth } from "./auth.js";
import { productsRouter } from "./routes/products.js";
import { categoriesRouter } from "./routes/categories.js";
import { ordersRouter } from "./routes/orders.js";
import { promoRouter } from "./routes/promo.js";
import { usersRouter } from "./routes/users.js";
import { statsRouter } from "./routes/stats.js";
import { settingsRouter } from "./routes/settings.js";
import { authRouter } from "./routes/auth.js";
import { uploadRouter, uploadsDir } from "./routes/upload.js";
import { wheelRouter } from "./routes/wheel.js";
import { pickupPointsRouter } from "./routes/pickupPoints.js";
import { getAdminIds } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "8mb" }));
app.use(telegramAuth);
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/admins", (_req, res) => res.json({ adminIds: getAdminIds() }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/promo", promoRouter);
app.use("/api/users", usersRouter);
app.use("/api/stats", statsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/wheel", wheelRouter);
app.use("/api/pickup-points", pickupPointsRouter);

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
