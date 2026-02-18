import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api', //env 파일에서 주소 가져옴
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log(`[Request] ${config.method.toUpperCase()} ${config.url} | Token: ${token ? '존재함' : '없음'}`); //토큰 여부
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 모든 요청 헤더에 토큰 자동 부착
  }
  return config;
});

api.interceptors.response.use( //토큰 불러오기.
  (response) => response, // 불러와지면 그대로,
  (error) => { //에러날경우 튕김
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      alert("세션이 만료되었습니다. 다시 로그인해주세요."); //순서 변경. 알림창이 뜨고 페이지이동

      localStorage.removeItem("token"); //로그아웃 로직 가져옴.
      localStorage.removeItem("user");
      
      window.location.href = "/login?message=expired";  //메인화면으로 강제 이동
    }
    return Promise.reject(error);
  }
);




export default api;