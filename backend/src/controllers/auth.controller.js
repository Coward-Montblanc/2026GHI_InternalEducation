import { authenticateUser } from "../utils/auth.js";
import jwt from "jsonwebtoken";
import response from "../utils/response.js";

import { AUTH_CONSTANTS, RESPONSE_MESSAGES } from "../config/constants.js";

export const login = async (req, res) => {
  try {
    const { login_id, password } = req.body;

    const user = await authenticateUser(login_id , password);
    if (!user) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND_USER);
    }

    if (user.status === AUTH_CONSTANTS.USER_STATUS.WITHDRAWN) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.FORBIDDEN_WITHDRAWN);
    }

    const token = jwt.sign(
      { login_id: user.login_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user; //成功時の応答
    return response.success(res, {token, user: userWithoutPassword }, RESPONSE_MESSAGES.SUCCESS.LOGIN);
  } catch (error) {
    console.error("ログインエラー:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.LOGIN_FAILED);
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const login_id = req.user.login_id;

    const user = await authenticateUser(login_id,password);
    if (!user) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND_USER);
    }

    return response.success(res, { success: true });
  } catch (error) {
    console.error("パスワード検証エラー:", error);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
};