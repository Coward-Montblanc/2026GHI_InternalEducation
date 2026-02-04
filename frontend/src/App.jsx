import React from "react";
// 💡 여기서 'as Router'가 핵심입니다!
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; //로그인 토큰용 함수
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Header from "./components/Header";
import ProductAddPage from "./pages/ProductAddPage";
import ProductDetail from "./pages/ProductDetail";
function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
         <Route path="/admin/product-add" element={<ProductAddPage />} />{/* 상품 등록 버튼 */}
         <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

