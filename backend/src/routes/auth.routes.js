import express from "express";
import { login, verifyPassword } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import response from "../utils/response.js";

const router = express.Router();

router.post("/login", login);

router.get("/check", authenticateToken, (req, res) => { //토큰 체크하는 라우트 추가, 프론트엔드에서 사용함
  return response.success(res, { authenticateToken : true });
});
router.post("/verify-password", authenticateToken, verifyPassword); //프론트엔드 마이페이지 회원정보 수정에서 사용함

export default router;