import api from "../api/axios";

//로그인
export const loginApi = async (loginId, password) => {
  try {
  const { data } = await api.post("/auth/login", {
    login_id: loginId,
    password,
  });
    return data;
  } catch (error) {
    console.error("ログインエラー:", error);
    throw error;
  }
};

//회원가입
export const signupApi = async (userData) => {
  try {
    const { data } = await api.post("/users", userData);
    return data;
  } catch (error) {
    console.error("会員登録エラー:", error);
    throw error;
  }
}; 
