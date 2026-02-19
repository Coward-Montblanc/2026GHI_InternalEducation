import api from "../api/axios";

//로그인
export const login = async (loginId, password) => {
  const { data } = await api.post("/auth/login", {
    login_id: loginId,
    password,
  });
  return data;
};

//회원가입
export const signup = async (userData) => {
  const { data } = await api.post("/users", userData);
  return data;
};
