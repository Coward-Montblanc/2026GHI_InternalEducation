import api from "../api/axios";

//カテゴリリストの照会
export const getCategories = async () => {
  try {
  const { data } = await api.get("/categories");
  return data;
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    throw error;
  }
};
