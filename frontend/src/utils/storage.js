export const storage = { //토큰 확인할때 자주 쓰는 스토리지함수
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)), //설정하기
  get: (key) => { //가져오기
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value; // 발견되면 그대로 반환
    }
  },
  remove: (key) => localStorage.removeItem(key), //지우기 : 유저 이름이나 토큰 이름
};