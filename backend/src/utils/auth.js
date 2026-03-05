import bcrypt from "bcrypt";
import * as userModel from "../models/user.model.js";

export const authenticateUser = async (login_id, password) => { //로그인 검증 함수
    console.log("유틸로 넘어온 ID:", login_id);
  if (!login_id || !password) return null;

  const user = await userModel.findByLoginId(login_id);
  if (!user) return null; //유저가 없으면 리턴
  const isMatch = await bcrypt.compare(password, user.password);
  
  return isMatch ? user : null;
};