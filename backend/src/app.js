import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("DB_USER:", process.env.DB_USER); //데이터베이스 연결 확인용 로그
console.log("DB_NAME:", process.env.DB_NAME);


import express from "express";
import userRoutes from "./routes/user.routes.js"; //라우터 연결
import swaggerUi from "swagger-ui-express"; //swagger 연결
import swaggerSpec from "./swagger.js";

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes); //라우터 연결
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));//swagger 사용

app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = 3000; //포트번호 swagger.js파일이랑 같아야함

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("APP START")
export default app;
