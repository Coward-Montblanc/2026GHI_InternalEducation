import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import AdminOrderEdit from "./pages/AdminOrderEditPage"
import NotFound from "./pages/NotFound"; //


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
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/notice/:id" element={<NoticeDetailPage />} />
          <Route path="/buy" element={<BuyPage />} />
          {/* ログインが必要なページ = AuthGuard で囲む */}
          <Route element={<AuthGuard />}>
            <Route path="/cart" element={ <CartPage /> } />
            <Route path="/order-confirm" element={<OrderConfirmPage />} />
            <Route path="/mypage" element={ <MyPage /> }> {/*マイページボタン*/}
              <Route index element={<MyProfile />} />
              <Route path="orders" element={<MyOrdersPage />} /> {/*注文履歴ページをマイページに挿入*/}
            </Route>
            <Route element={<AuthGuard requireAdmin/>}>
              <Route path="/event/write" element={<EventWritePage />} />
              <Route path="/event/edit/:id" element={<EventEditPage />} />
              <Route path="/notice/write" element={<NoticeWritePage />} />
              <Route path="/notice/edit/:id" element={<NoticeEditPage />} />
              <Route path="/admin/product-add" element={ <ProductAddPage /> } />
              <Route path="/admin/product-edit/:id" element={ <AdminProductEditPage /> } />
              <Route path="/admin/orders" element={<MyPage initialView="adminOrders" />} />
              <Route path="/admin/orders/edit/:orderId" element={<AdminOrderEdit />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} /> {/* Routeされていないページは NotFound */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

