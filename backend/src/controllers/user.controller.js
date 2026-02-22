import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import response from "../utils/response.js";
export async function getUsers(req, res) {
  try {
    const users = await userModel.findAllUsers();
    res.json(users);
  } catch (err) {
    console.error("ユーザー取得エラー:", err);
    return response.error(res, "DB エラーが発生しました。", 500);
  }
}

export async function createUser(req, res) {
  const { login_id, password, name, email, phone, zip_code, address, address_detail, role } = req.body;
  
  if (!login_id || !password || !name || !email || !phone) {
    return res.status(400).json({ message: "必須情報(ID、パスワード、名前、メール、電話番号)が不足しています。" });
  }

  const regex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{4,}$/; //영문(a-z), 숫자(0~9) 혼합 4글자 이상 제약
  
  if(!regex.test(login_id)){ return response.error(res, "IDは英字と数字を含む4文字以上である必要があります。", 400);}
  if(!regex.test(password)){ return response.error(res, "パスワードは英字と数字を含む4文字以上である必要があります。", 400);}
  if (!email.includes('@')) { response.error(res, "有効なメール形式ではありません。", 400);}  //이메일에 @필수

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const result = await userModel.createUser({
      login_id,
      password: hashedPassword,
      name,
      email,
      phone,
      zip_code,
      address,
      address_detail,
      role: role || "USER",
    });

    res.status(201).json({
      login_id,
      name,
      message: "会員登録成功"
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "重複したIDまたはメールが存在します。" });
    }
    console.error(err);
    return response.error(res, "DB エラーが発生しました。", 500);
  }
}

export async function deleteUser(req, res) { //회원 삭제
  const { id } = req.params;

  try {
    const result2 = await userModel.deleteUserById(id); //중복실행되는거같아서 잠시 변수 이름 바꿈.
    if (result2.affectedRows === 0) {
      return response.error(res, "会員が存在しません。", 404);
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    return response.error(res, "DB エラーが発生しました。", 500);
  }
}

export async function updateUser(req, res) { //회원정보 수정
  const { id } = req.params; // login_id
  const { name, email, phone, zip_code, address, address_detail, role, password } = req.body;

  try {
    const updateData = {
      name,
      email,
      phone,
      zip_code,
      address,
      address_detail,
      role: role || "USER",
    };

    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const result = await userModel.updateUser(id, updateData);

    if (result.affectedRows === 0) {
      return response.error(res, "登録された会員が存在しません。", 404);
    }

    res.json({ message: "会員情報の修正が完了しました。" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return response.error(res, "データベース内に重複する値が存在します。", 409);
    }
    console.error(err);
    return response.error(res, "DB エラーが発生しました。", 500);
  }
}




