//ログイントークン検証
import jwt from "jsonwebtoken";
import { RESPONSE_MESSAGES } from "../config/constants.js";
import response from "../utils/response.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NEED_LOGIN, 401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => { //トークンを検証する
    if (err) return response.error(res , RESPONSE_MESSAGES.CLIENT_ERROR.NEED_TOKEN, 403);
    
    req.user = user;
    next();
  });
};