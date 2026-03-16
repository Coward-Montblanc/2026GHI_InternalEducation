import api from "../api/axios";

export const getAdminUsers = async (params) => {
  try {
    const { data } = await api.get("/users/adminUsers", { params });
    console.log(data);
    return data;
  } catch (error) {
    console.error("ユーザ一覧取得エラー:", error);
    throw error;
  }
};