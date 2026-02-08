import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
//express 중복적용되어있었습니다.
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();

// --- [순서 중요: 1. 기본 설정 미들웨어] ---
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 해석 (라우터보다 무조건 위!)
app.use(express.urlencoded({ extended: true })); // FormData/URL-encoded 해석

// --- [순서 중요: 2. 정적 파일 및 문서] ---
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- [순서 중요: 3. API 라우터 설정] ---
// 이제 모든 데이터가 해석된 상태에서 라우터로 들어갑니다.
app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes); 

app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("APP START");

export default app;