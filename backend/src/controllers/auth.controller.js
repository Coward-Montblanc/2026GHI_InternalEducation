import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import response from "../utils/response.js";

export const login = async (req, res) => {
  const { login_id, password } = req.body;

  try {
    const user = await userModel.findByLoginId(login_id); //유저id 찾기
    if (!user) {
      return response.error(res, "IDまたはパスワードが一致しません。", 401);
    }
    const isMatch = await bcrypt.compare(password, user.password); //비밀번호 검증
    if (!isMatch) {
      return response.error(res, "IDまたはパスワードが一致しません。", 401);
    }

    
    const tokenTime = "5m"; //시간 지정
    const token = jwt.sign( //JWT 토큰 발급　
      { login_id: user.login_id, role: user.role },
      process.env.JWT_SECRET, //env파일에서 키 가져옴
      { expiresIn: tokenTime }
    );
    console.log("설정된 만료 시간:", tokenTime); //토큰 시간 확인용 콘솔로그


    const { password: _, ...userWithoutPassword } = user; //성공시 응답
    return response.success(res, {token, user: userWithoutPassword }, "로그인 성공");
    


  } catch (error) {
    console.error("ログインエラー:", error);
    return response.error(res, "ログイン処理中にサーバーエラーが発生しました。");
  }
  

  res.json({ user, token });
  
};