import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Produkten hittades inte" });
  }

  res.json(data);
});

app.get("/api/categories", async (req, res) => {
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post("/api/orders", async (req, res) => {
  const { email, phone, full_name, address, postal_code, city, items } =
    req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Varukorgen är tom" });
  }

  const productsIds = items.map((item) => item.product_id);
  const { data: dbProducts, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productsIds);

  if (productsError) {
    return res.status(500).json({ error: productsError.message });
  }

  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = dbProducts.find((p) => p.id === item.product_id);
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    return {
      product_id: product.id,
      seller_id: product.seller_id,
      product_name: product.name,
      product_brand: product.brand,
      quantity: item.quantity,
      unit_price: product.price,
      line_total: lineTotal,
    };
  });

  const shipping = 49;
  const total = subtotal + shipping;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      email,
      phone,
      full_name,
      address,
      postal_code,
      city,
      subtotal,
      shipping,
      total,
      status: "ordered",
    })
    .select()
    .single();

  if (orderError) {
    return res.status(500).json({ error: orderError.message });
  }

  const itemsWithOrderId = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId);

  if (itemsError) {
    return res.status(500).json({ error: itemsError.message });
  }
  res.status(201).json(order);
});

app.get("/api/orders", async (req, res) => {
  const { email } = req.query;

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (email) {
    query = query.eq("email", email);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get("/api/orders/:id", async (req, res) => {
  const { id } = req.params;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError) {
    return res.status(404).json({ error: "Ordern hittades inte" });
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if (itemsError) {
    return res.status(500).json({ error: itemsError.message });
  }

  res.json({ ...order, items: orderItems });
});

app.patch(
  "/api/orders/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "ordered",
      "processing",
      "shipped",
      "delivered",
      "refunded",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Ogiltig status" });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  },
);

app.post(
  "/api/products",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const {
      title,
      brand,
      price,
      category,
      condition,
      size,
      color,
      material,
      description,
    } = req.body;

    if (!title || !brand || !price || !condition) {
      return res
        .status(400)
        .json({ error: "Fyll i produktnamn, varumärke, pris och skick" });
    }

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: title,
        brand,
        price,
        category_id: category || null,
        condition,
        size,
        color,
        material,
        description,
        image_url: imageUrl,
        alt_text: title,
        status: "approved",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  },
);

app.get("/api/products", async (req, res) => {
  const { status } = req.query;

  let query = supabase.from("products").select("*");
  query = status ? query.eq("status", status) : query.eq("status", "approved");

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post("/api/products/submit", upload.single("image"), async (req, res) => {
  const {
    title,
    sellerName,
    price,
    category,
    condition,
    size,
    color,
    material,
    description,
  } = req.body;

  if (!title || !sellerName || !price) {
    return res
      .status(400)
      .json({ error: "Fyll i produktnamn, ditt namn och pris" });
  }

  let imageUrl = null;

  if (req.file) {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);
    imageUrl = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: title,
      brand: "Okänt märke",
      seller_name: sellerName,
      price,
      category_id: category || null,
      condition,
      size,
      color,
      material,
      description,
      image_url: imageUrl,
      alt_text: title,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

app.patch(
  "/api/products/:id/status",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "sold",
      "archived",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Ogiltig status" });
    }

    const { data, error } = await supabase
      .from("products")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  },
);

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Fyll i namn, e-post och lösenord" });
  }

  const [firstName, ...rest] = name.trim().split(" ");
  const lastName = rest.join(" ") || "-";

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      role: "customer",
    })
    .select("id, first_name, last_name, email, role")
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "E-postadressen används redan" });
    }
    return res.status(500).json({ error: error.message });
  }

  const token = jwt.sign(
    { userId: data.id, role: data.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.status(201).json({ user: data, token });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Fyll i e-post och lösenord" });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: "Fel e-post eller lösenord" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Fel e-post eller lösenord" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Du måste vara inloggad" });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Ogiltig eller utgången session" });
  }
}
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Kräver admin-behörighet" });
  }
  next();
}

async function getOrCreateCart(userId) {
  const { data: existingRows, error: selectError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (selectError) throw selectError;
  if (existingRows && existingRows.length > 0) return existingRows[0];

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return created;
}

app.get("/api/cart", requireAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    const { data, error } = await supabase
      .from("cart_items")
      .select("product_id, quantity, products(*)")
      .eq("cart_id", cart.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cart/items", requireAuth, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  try {
    const cart = await getOrCreateCart(req.user.userId);

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", product_id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("cart_id", cart.id)
        .eq("product_id", product_id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({ cart_id: cart.id, product_id, quantity })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/cart/items/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await getOrCreateCart(req.user.userId);
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/cart/items/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await getOrCreateCart(req.user.userId);
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("product_id", productId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/favorites", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id, products(*)")
    .eq("user_id", req.user.userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/favorites/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: req.user.userId, product_id: productId });

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ success: true });
});

app.delete("/api/favorites/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", req.user.userId)
    .eq("product_id", productId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
