import * as userModel from "../models/user.model.js"; //경로에서 DB쿼리문 모델 임포트.
import bcrypt from "bcrypt";

/*export async function getUsers(req, res) { //회원 조회
  const users = await userModel.findAll(); //모델에서 findAll 쿼리문 실행
  res.json(users); //출력
}*/


export async function getUsers(req, res) {
  try {
    const users = await userModel.findAllUsers();
    res.json(users);
  } catch (err) {
    console.error("에러코드:", err);
    res.status(500).json({ message: "DB 에러" });
  }
}

export async function createUser(req, res) { //회원 추가
  const { login_id, password, name, email, role } = req.body;

  if (!login_id || !password || !name || !email) {
    return res.status(400).json({ message: "공란이 있으면 안됩니다." });
  }

  try {
    const result = await userModel.createUser({
      login_id,
      password,
      name,
      email,
      role: role || "USER",
    });

    res.status(201).json({
      user_id: result.insertId,
      login_id,
      name,
      email,
      role: role || "USER",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "중복된 ID 또는 이메일" });
    }
    console.error(err);
    res.status(500).json({ message: "DB 에러" });
  }
}

export async function deleteUser(req, res) { //회원 삭제
  const { id } = req.params;

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

export async function updateUser(req, res) { //회원정보 업데이트
  const { id } = req.params;
  const { login_id, name, email, role, password } = req.body;

  try {
    const updateData = {
      login_id,
      name,
      email,
      role: role || "USER",
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await userModel.updateUser(id, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "등록된 회원이 없습니다." });
    }

    res.json({ message: "회원 정보 수정 완료." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "중복 값이 존재합니다." });
    }
    console.error(err);
    res.status(500).json({ message: "DB 에러" });
  }
}