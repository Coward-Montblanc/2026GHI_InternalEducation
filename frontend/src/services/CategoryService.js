import api from "../api/axios";

//카테고리 목록 조회
export const getCategories = async () => {
  try {
  const { data } = await api.get("/categories");
  return data;
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    throw error;
  }
};
