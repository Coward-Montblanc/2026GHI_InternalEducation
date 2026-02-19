import api from "../api/axios";

//카테고리 목록 조회
export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data;
};
