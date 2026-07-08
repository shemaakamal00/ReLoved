import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config ();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

app.get("/api/products", async (req, res) => {
    const {data, error} = await supabase
    .from("products")
    .select("*")
    .eq("status", "approved");

    if(error){
        return res.status(500).json({error: error.message});
    }

    res.json(data);
});

app.get("/api/products/:id", async (req, res) => {
    const {id} = req.params;

    const {data, error} = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

    if (error){
        return res.status(404).json({ error: "Produkten hittades inte" });
    }

    res.json(data);
});

app.get("/api/catefories", async(req, res) => {
    const {data, error} = await supabase
    .from ("categories")
    .select ("*");

    if (error){
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

const PORT = process.env.port || 3001;
app.listen (PORT, () => {
    console.log(`Servern körs på http://localhost:${PORT}`);
});