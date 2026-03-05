import { authenticateUser } from "../utils/auth.js";
import jwt from "jsonwebtoken";
import response from "../utils/response.js";

export const login = async (req, res) => {
  try {
    const { login_id, password } = req.body;

    const user = await authenticateUser(login_id , password);
    if (!user) {
      return response.error(res, "IDまたはパスワードが一致しません。", 401);
    }

    if (user.status === 1) {
      return response.error(res, "退会したアカウントです。カスタマーセンターにお問い合わせください。", 403);
    }

    const tokenTime = "12h"; //시간 지정
    const token = jwt.sign( //JWT 토큰 발급　
      { login_id: user.login_id, role: user.role },
      process.env.JWT_SECRET, //env파일에서 키 가져옴
      { expiresIn: tokenTime }
    );
    console.log("설정된 만료 시간:", tokenTime); //토큰 시간 확인용 콘솔로그

    const { password: _, ...userWithoutPassword } = user; //성공시 응답
    return response.success(res, {token, user: userWithoutPassword }, "ログイン成功");
  } catch (error) {
    console.error("ログインエラー:", error);
    return response.error(res, "ログイン処理中にサーバーエラーが発生しました。");
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const login_id = req.user.login_id;

    const user = await authenticateUser(login_id,password);
    if (!user) {
      return response.error(res, "ユーザーが見つかりません。", 404);
    }

    return response.success(res, { success: true }, "本人確認に成功しました。");
  } catch (error) {
    console.error("パスワード検証エラー:", error);
    return response.error(res, "サーバーエラーが発生しました。");
  }
};