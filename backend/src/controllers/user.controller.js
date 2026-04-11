import * as userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import response from "../utils/response.js";
import { RESPONSE_MESSAGES, DATA_CONSTRAINTS } from "../config/constants.js";

export async function getUsers(req, res) {
  try {
    const users = await userModel.findAllUsers();
    res.json(users);
  } catch (err) {
    console.error("ユーザー取得エラー:", err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
}

export const getAdminUsers = async (req, res) => {
    try {

        const { name, login_id, email, phone, zip_code, status, role, startDate, endDate, sortField, sortOrder } = req.query;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const offset = (Number(page) - 1) * limit;

        const filters = {
            name: name || undefined,
            login_id: login_id || undefined,
            email: email || undefined,
            phone: phone || undefined,
            zip_code: zip_code || undefined,
            status: (status && status !== "all") ? status : undefined,
            role: (role && role !== "all") ? role : undefined,
            created_at: (startDate && endDate) ? [startDate, endDate] : undefined,
            limit: limit,
            offset: offset,
            sortField: sortField || 'created_at',
            sortOrder: sortOrder || 'DESC'
        };

        const { users, totalCount } = await userModel.findUsersAdmin(filters);

        return response.success(res, {
            users,
            pagination: {
                totalItems: totalCount,
                currentPage: Number(page),
                totalPages: Math.ceil(totalCount / limit) || 1
            }
        }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
    } catch (error) {
        console.error("ユーザー取得エラー:", error);
        return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
    }
};


export async function createUser(req, res) {
  const { login_id, password, name, email, phone, zip_code, address, address_detail, role } = req.body;
  
  if (!login_id || !password || !name || !email || !phone) {
    return response.error(res, DATA_CONSTRAINTS.SIGNUP.DEFAULT);
  }

  const regex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{4,}$/; //英語（a-z）、数字（0〜9）混合4文字以上の制約
  
  if(!regex.test(login_id)){ return response.error(res, DATA_CONSTRAINTS.SIGNUP.ID);}
  if(!regex.test(password)){ return response.error(res, DATA_CONSTRAINTS.SIGNUP.PASSWORD);}
  if (!email.includes('@')) { return response.error(res, DATA_CONSTRAINTS.SIGNUP.MAIL);}  

  const hashedPassword = await bcrypt.hash(password, DATA_CONSTRAINTS.SIGNUP.SALTROUNDS);
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
        await userModel.createAddress({ //会員登録時に基本配送先を作成
          login_id,
          address_name: '基本配送先',
          name,
          zip_code,
          address,
          address_detail,
          phone
        });
    } catch (addrErr) {
        console.error(RESPONSE_MESSAGES.CLIENT_ERROR.DELIVERY_ADDRESS_ERROR, addrErr);
    }
    return response.success(res, { login_id, name }, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.DATA_OVERLAP);
    }
    console.error(err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
}

export async function getUserAddresses(req, res) {
  const login_id = req.user.login_id; //ルーターミドルウェアからユーザーデータを受け取る
  
  try {
    const addresses = await userModel.findAddressesByLoginId(login_id);
    res.json(addresses);
  } catch (err) {
    console.error(err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
}

export async function addUserAddress(req, res) {
    const login_id = req.user.login_id; //ルーターミドルウェアからユーザーデータを受け取る
    const { address_name, receiver_name, zip_code, address, address_detail, phone } = req.body;

    if (!address_name || !receiver_name || !zip_code || !address || !phone) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_ENTERED);
    }

    try {
        await userModel.createAddress({　//該当する名前の配送先があることを確認する
            login_id,
            address_name, 
            name: receiver_name,
            zip_code,
            address,
            address_detail,
            phone,
            is_default: 0 //新しく追加するのはデフォルトで0
        });
        return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DELIVERY_ADDRESS_CREATE_SUCCESS, 201);
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return response.error(res, DATA_CONSTRAINTS.SIGNUP.DELIVERY_ADDRESS);
        }
        console.error(err);
        return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
    }
}

export async function updateDefaultAddress(req, res) {
  const login_id = req.user.login_id;
  const { address_name } = req.body;

  try {
    await userModel.setDefaultAddress(login_id, address_name);
    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DELIVERY_ADDRESS_CHANGE_SUCCESS);
  } catch (err) {
    console.error(err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
}

export async function deleteUser(req, res) { //会員の削除
  const { id } = req.params;

  try {
    const result2 = await userModel.deleteUserById(id);
    if (result2.affectedRows === 0) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND_USER);
    }
    return response.success(res, {}, "", 200);
  } catch (err) {
    console.error(err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
}

export async function updateUser(req, res) { //会員情報の修正
  const id = req.params.id || req.user?.login_id;
  if (!id) {
    return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND);
  }

  const { name, email, phone, zip_code, address, address_detail, role, password, status } = req.body;

  try {
    const User = await userModel.findByLoginId(id);
    if (!User) {
        return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND_USER);
    }
    const updateData = {
      name: name ?? User.name,
      email: email ?? User.email,
      phone: phone ?? User.phone,
      zip_code: zip_code ?? User.zip_code,
      address: address ?? User.address,
      address_detail: address_detail ?? User.address_detail,
      role: role ?? User.role,
      status: (status !== undefined) ? status : User.status
    };

    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const result = await userModel.updateUser(id, updateData);

    if (result.affectedRows === 0) {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.NOT_FOUND_USER);
    }

    return response.success(res, {}, RESPONSE_MESSAGES.SUCCESS.DEFAULT);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return response.error(res, RESPONSE_MESSAGES.CLIENT_ERROR.DATA_OVERLAP);
    }
    console.error(err);
    return response.error(res, RESPONSE_MESSAGES.SERVER_ERROR.DEFAULT);
  }
}




