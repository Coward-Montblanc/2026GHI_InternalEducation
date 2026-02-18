import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { login_id, password } = req.body;

  try {
    const user = await userModel.findByLoginId(login_id); //유저id 찾기
    if (!user) {
      return res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }
    const isMatch = await bcrypt.compare(password, user.password); //비밀번호 검증
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }

    
    const tokenTime = "5m"; //시간 지정
    const token = jwt.sign( //JWT 토큰 발급　
      { login_id: user.login_id, role: user.role },
      process.env.JWT_SECRET, //env파일에서 키 가져옴
      { expiresIn: tokenTime }
    );
    console.log("설정된 만료 시간:", tokenTime); //토큰 시간 확인용 콘솔로그


    const { password: _, ...userWithoutPassword } = user; //성공시 응답
    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });


  } catch (error) {
    console.error("로그인 에러:", error);
    res.status(500).json({ success: false, message: "로그인 처리 중 서버 에러 발생" });
  }
  

  res.json({ user, token });
  
};