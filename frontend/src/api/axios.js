import axios from "axios";

const api = axios.create({
  url : import.meta.env.VITE_API_URL //.env파일에서 주소를 가져옴
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 모든 요청 헤더에 토큰 자동 부착
  }
  return config;
});

export default api;