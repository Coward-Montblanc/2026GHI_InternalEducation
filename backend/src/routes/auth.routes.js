import express from "express";
import { login, verifyPassword } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import response from "../utils/response.js";

const router = express.Router();

router.post("/login", login);

router.get("/check", authenticateToken, (req, res) => {
  return response.success(res, { authenticateToken : true });
});
router.post("/verify-password", authenticateToken, verifyPassword); 

export default router;