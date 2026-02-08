import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await db.query("SET NAMES utf8mb4");
    
    const [rows] = await db.execute("SELECT * FROM categories ORDER BY category_id ASC");

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


export default router;