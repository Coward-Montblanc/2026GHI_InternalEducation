import api from "../api/axios";

//로그인
export const loginApi = async (loginId, password) => {
  const { data } = await api.post("/auth/login", {
    login_id: loginId,
    password,
  });
  return data;
};

//회원가입
export const signupApi = async (userData) => {
  const { data } = await api.post("/users", userData);
  return data;
};
