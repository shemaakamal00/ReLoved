// Karta över hela API:et
import { Router } from "express";

import adminRouter from "./admin.js";
import authRouter from "./auth.js";
import googleAuthRouter from "./googleAuth.js";
import cartRouter from "./cart.js";
import categoriesRouter from "./categories.js";
import checkoutRouter from "./checkout.js";
import currencyRouter from "./currency.js";
import favoritesRouter from "./favorites.js";
import ordersRouter from "./orders.js";
import productsRouter from "./products.js";
import searchRouter from "./search.js";
import sellerRouter from "./seller.js";
import shippingRouter from "./shipping.js";
import usersRouter from "./users.js";

const api = Router();

// Butiken
api.use("/products", productsRouter);
api.use("/categories", categoriesRouter);
api.use("/search", searchRouter);
api.use("/currency", currencyRouter);

// Köp
api.use("/cart", cartRouter);
api.use("/favorites", favoritesRouter);
api.use("/shipping", shippingRouter);
api.use("/checkout", checkoutRouter);
api.use("/orders", ordersRouter);

// Konton
api.use("/auth/google", googleAuthRouter);
api.use("/auth", authRouter);
api.use("/users", usersRouter);

// Paneler
api.use("/seller", sellerRouter);
api.use("/admin", adminRouter);

export default api;
