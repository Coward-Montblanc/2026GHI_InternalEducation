import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

export async function getUsers(req, res) {
  try {
    const users = await userModel.findAllUsers();
    res.json(users);
  } catch (err) {
    console.error("에러코드:", err);
    res.status(500).json({ message: "DB 에러" });
  }
}

export async function createUser(req, res) {
  const { login_id, password, name, email, phone, zip_code, address, address_detail, role } = req.body;
  
  if (!login_id || !password || !name || !email || !phone) {
    return res.status(400).json({ message: "필수 정보(ID, 비밀번호, 이름, 이메일, 전화번호)가 누락되었습니다." });
  }
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
      message: "회원가입 성공"
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "중복된 ID 또는 이메일이 존재합니다." });
    }
    console.error(err);
    res.status(500).json({ message: "DB 에러" });
  }
}

export async function deleteUser(req, res) { //회원 삭제
  const { id } = req.params;
  console.log("------------------------------------------");
  console.log("백엔드 수신 ID:", id); 
  console.log("아이디 타입:", typeof id);
  console.log("------------------------------------------");
  try {
    const result = await userModel.deleteUserById(id); 
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "회원 없음" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB 에러" });
  }
}

export async function updateUser(req, res) {
  const { id } = req.params; // login_id
  const { name, email, phone, zip_code, address, address_detail, role, password } = req.body;

  try {
    const updateData = {
      name, email, phone, zip_code, address, address_detail,
      role: role || "USER",
    };

    // 💡 비밀번호 수정 시에도 해싱 처리 필수!
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const result = await userModel.updateUser(id, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "등록된 회원이 없습니다." });
    }

    res.json({ message: "회원 정보 수정 완료." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "데이터베이스 내 중복 값이 존재합니다." });
    }
    console.error(err);
    res.status(500).json({ message: "DB 에러" });
  }
}




