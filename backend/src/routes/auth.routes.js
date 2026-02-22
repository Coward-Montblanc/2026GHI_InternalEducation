import express from "express";
import { login } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import response from "../utils/response.js";

const router = express.Router();

router.post("/login", login);

router.get("/check", authenticateToken, (req, res) => { //토큰 체크하는 라우트 추가, 프론트엔드에서 사용함
  return response.success(res, { authenticateToken : true });
});

export default router;