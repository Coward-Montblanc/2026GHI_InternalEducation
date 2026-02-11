import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; //로그인 토큰용 함수
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Header from "./components/Header";
import ProductAddPage from "./pages/ProductAddPage";
import ProductDetail from "./pages/ProductDetail";
import EventPage from "./pages/EventPage";
import NoticePage from "./pages/NoticePage";
import CartPage from "./pages/CartPage";
import BuyPage from "./pages/BuyPage";

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
          <Route path="/event" element={<EventPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/buy" element={<BuyPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

