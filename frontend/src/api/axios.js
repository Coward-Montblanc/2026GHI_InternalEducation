import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api', //envファイルからアドレスを取得する
});

api.interceptors.request.use((config) => {
  const token = storage.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // すべてのリクエストヘッダにトークンを自動添付
  }
  return config;
});


api.interceptors.response.use( 
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      storage.remove("token");
      storage.remove("user");
      if (window.location.pathname !== '/login') {
        window.location.href = "/login?exp=true"; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;