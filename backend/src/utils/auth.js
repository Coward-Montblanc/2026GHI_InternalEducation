import bcrypt from "bcrypt";
import * as userModel from "../models/user.model.js";

export const authenticateUser = async (login_id, password) => { //ログイン検証
  if (!login_id || !password) return null;

  const user = await userModel.findByLoginId(login_id);
  if (!user) return null;
  const isMatch = await bcrypt.compare(password, user.password);
  
  return isMatch ? user : null;
};