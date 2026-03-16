import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; //로그인 토큰용 함수
import AuthGuard from "./components/auth/AuthGuard"; 
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Header from "./components/Header";
import ProductAddPage from "./pages/ProductAddPage";
import AdminProductEditPage from "./pages/AdminProductEditPage";
import ProductDetail from "./pages/ProductDetail";
import EventPage from "./pages/EventPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventWritePage from "./pages/EventWritePage";
import EventEditPage from "./pages/EventEditPage";
import NoticePage from "./pages/NoticePage";
import NoticeDetailPage from "./pages/NoticeDetailPage";
import NoticeWritePage from "./pages/NoticeWritePage";
import NoticeEditPage from "./pages/NoticeEditPage";
import CartPage from "./pages/CartPage";
import BuyPage from "./pages/BuyPage";
import OrderConfirmPage from "./pages/OrderConfirmPage";
import MyPage from "./pages/MyPage";
import MyProfile from "./pages/MyProfile";
import MyOrdersPage from "./pages/MyOrdersPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/event" element={<EventPage />} />
          <Route path="/event/write" element={<EventWritePage />} />
          <Route path="/event/:id/edit" element={<EventEditPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/notice/write" element={<NoticeWritePage />} />
          <Route path="/notice/:id/edit" element={<NoticeEditPage />} />
          <Route path="/notice/:id" element={<NoticeDetailPage />} />
          <Route path="/buy" element={<BuyPage />} />
          {/* 로그인이 필요한 페이지들 = AuthGuard로 감싸기 */}
          <Route element={<AuthGuard />}>
            <Route path="/cart" element={ <CartPage /> } />
            <Route path="/order-confirm" element={<OrderConfirmPage />} />
            <Route path="/mypage" element={ <MyPage /> }> {/* 마이페이지 버튼 */}
              <Route index element={<MyProfile />} />
              <Route path="orders" element={<MyOrdersPage />} /> {/* 주문 내역 페이지를 마이페이지 안으로 넣음*/}
            </Route>
            <Route element={<AuthGuard requireAdmin/>}>
              <Route path="/admin/product-add" element={ <ProductAddPage /> } />
              <Route path="/admin/product-edit/:id" element={ <AdminProductEditPage /> } />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

