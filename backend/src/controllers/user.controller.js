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

export const getAdminUsers = async (req, res) => {
    try {
        const { name, login_id, email, phone, zip_code, status, role, startDate, endDate, page = 1, limit = 10 } = req.query;
        
        const pageSize = parseInt(limit) || 10;
        const currentPage = parseInt(page) || 1;
        const offset = (currentPage - 1) * pageSize;

        const filters = {
            name, login_id, email, phone, zip_code,
            status: status !== "" ? status : undefined,
            role: role !== "" ? role : undefined,
            created_at: (startDate && endDate) ? [startDate, endDate] : undefined,
            limit: pageSize,
            offset: offset
        };

        const { users, totalCount } = await userModel.findUsersAdmin(filters);

        res.json({
            success: true,
            users,
            pagination: {
                totalItems: totalCount,
                currentPage: currentPage,
                totalPages: Math.ceil(totalCount / pageSize) || 1
            }
        });
    } catch (error) {
        console.error("User Admin Error:", error);
        res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
    }
};


export async function createUser(req, res) {
  const { login_id, password, name, email, phone, zip_code, address, address_detail, role } = req.body;
  
  if (!login_id || !password || !name || !email || !phone) {
    return res.status(400).json({ message: "必須情報(ID、パスワード、名前、メール、電話番号)が不足しています。" });
  }

  const regex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{4,}$/; //영문(a-z), 숫자(0~9) 혼합 4글자 이상 제약
  
  if(!regex.test(login_id)){ return response.error(res, "IDは英字と数字を含む4文字以上である必要があります。", 400);}
  if(!regex.test(password)){ return response.error(res, "パスワードは英字と数字を含む4文字以上である必要があります。", 400);}
  if (!email.includes('@')) { return response.error(res, "有効なメール形式ではありません。", 400);}  //이메일에 @필수

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

    try {
        await userModel.createAddress({ //회원가입시 기본배송지 생성
          login_id,
          address_name: '基本配送先',
          name,
          zip_code,
          address,
          address_detail,
          phone
        });
        console.log(`配送先登録完了。 ID: ${login_id}`);
    } catch (addrErr) {
        console.error("配送先登録エラー:", addrErr);
    }

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

export async function getUserAddresses(req, res) {
  const login_id = req.user.login_id; //라우터 미들웨어에서 유저 데이터 받아옴
  
  try {
    const addresses = await userModel.findAddressesByLoginId(login_id);
    res.json(addresses);
  } catch (err) {
    console.error(err);
    return response.error(res, "配送先リストの取得中にエラーが発生しました。(DBエラー)", 500);
  }
}

export async function addUserAddress(req, res) {
    const login_id = req.user.login_id; //라우터 미들웨어에서 유저 데이터 받아옴
    const { address_name, receiver_name, zip_code, address, address_detail, phone } = req.body;

    if (!address_name || !receiver_name || !zip_code || !address || !phone) {
        return res.status(400).json({ message: "必須情報がありません。" });
    }

    try {
        await userModel.createAddress({　
            login_id,
            address_name, 
            name: receiver_name,
            zip_code,
            address,
            address_detail,
            phone,
            is_default: 0 // 새로 추가하는 건 기본적으로 0
        });

        res.status(201).json({ message: "配送先登録成功。" });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "同じ名前の配送先が存在します。" });
        }
        console.error(err);
        res.status(500).json({ message: "サーバーエラーが発生しました。" });
    }
}

export async function updateDefaultAddress(req, res) {
  const login_id = req.user.login_id;
  const { address_name } = req.body;

  try {
    await userModel.setDefaultAddress(login_id, address_name);
    res.json({ message: "メイン配送先が変更されました。" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "変更中にエラーが発生しました。" });
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
  const id = req.params.id || req.user?.login_id;
  if (!id) {
    console.error("変更先 IDエラー");
    return response.error(res, "変更先 ID が見つかりません。", 400);
  }

  const { name, email, phone, zip_code, address, address_detail, role, password, status } = req.body;

  try {
    const User = await userModel.findByLoginId(id);
    if (!User) {
        return response.error(res, "登録された会員が存在しません。", 404);
    }
    const updateData = {
      name: name ?? User.name,
      email: email ?? User.email,
      phone: phone ?? User.phone,
      zip_code: zip_code ?? User.zip_code,
      address: address ?? User.address,
      address_detail: address_detail ?? User.address_detail,
      role: role ?? User.role,
      status: (status !== undefined) ? status : User.status //탈퇴할때만 수정되게
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




