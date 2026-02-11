//로그인 토큰 검증
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; //요청 헤더에서 토큰 꺼내기
  console.log("1. 수신된 헤더:", authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log("2. 추출된 토큰:", token);
  
  if (!token) return res.status(401).json({ message: "로그인이 필요합니다." }); //토큰이 없을경우

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => { //토큰 검증하기
    if (err) return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    
    req.user = user; //유저 정보  저장 
    next(); //검증 완료
  });
};