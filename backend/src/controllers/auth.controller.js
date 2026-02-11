import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { login_id, password } = req.body;

  try {
    //유저 찾기
    const user = await userModel.findByLoginId(login_id);

    if (!user) {
      return res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    //비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    //JWT 토큰 발급
    const token = jwt.sign(
      { login_id: user.login_id, role: user.role }, //로그인 아이디와 role확인
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    //성공 응답
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("로그인 에러:", error);
    res.status(500).json({ success: false, message: "로그인 처리 중 서버 에러 발생" });
  }
};