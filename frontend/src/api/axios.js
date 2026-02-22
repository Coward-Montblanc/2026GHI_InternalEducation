import axios from "axios";
import { storage } from "../utils/storage"; //로그인 전용 함수 모음

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api', //env 파일에서 주소 가져옴
});

api.interceptors.request.use((config) => {
  const token = storage.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 모든 요청 헤더에 토큰 자동 부착
  }
  return config;
});


api.interceptors.response.use( //토큰 불러오기.
  (response) => response, // 불러와지면 그대로,
  (error) => { //에러날경우 튕김
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      storage.remove("token"); //로그아웃 로직 가져옴.
      storage.remove("user");
      if (window.location.pathname !== '/login') { //로그인 창으로 보내고 alert문 띄우기
        window.location.href = "/login?exp=true"; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;