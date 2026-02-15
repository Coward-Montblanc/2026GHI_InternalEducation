import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();

app.use(cors()); // CORS 허용
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes); 
app.use("/api/cart", cartRoutes);
app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("APP START");

export default app;