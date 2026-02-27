import { useState, useEffect } from "react";
import { getProductById } from "../services/ProductService";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart } from "../services/CartService";
import { singleProductToItems } from '../services/OrderService.js';
import { storage } from "../utils/storage"; //스토리지 

export const useProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(""); // 현재 크게 보여줄 이미지
  const url = import.meta.env.VITE_API_URL; 

  const user = storage.get("user"); // 로그인 정보 확인
  const isLoggedIn = !!storage.get("token"); // 로그인 상태 확인
  useEffect(() => {
        // 상품 상세 정보 가져오기 (이미지 배열이 포함되어 있어야 함)
    const getProductDetail = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
                // 첫 번째 이미지를 메인으로 설정 (보통 DB 조회 시 main_image가 먼저 오도록 쿼리)
        if (data.images && data.images.length > 0) {
          setMainImage(`${url}${data.images[0].image_url}`);
        }
      } catch (err) {
        if (err.response) {
          if (err.response.status === 404) {
            setError("商品がありません。");
          } else if (err.response.status === 500) {
            setError("サーバーエラーが発生しました。しばらくしてからもう一度お試しください。");
          } else {
            setError(`HTTP error! status: ${err.response.status}`);
          }
        } else {
          setError(err.message);
        }
        console.error("Error code : ", err);
      }
    };
    getProductDetail();
  }, [id, url]);

  const AddToCart = async () => {
    if (!isLoggedIn) {
      alert("ログイン後に実行してください"); //비회원 주문 탭필요
      return;
    }
    try {
      const data = await addToCart(user.login_id, id, quantity);
      if (data.success) {
        if (window.confirm(`「${product.name}」${quantity}個がカートに追加されました。カートに移動しますか？`)) {
          navigate("/cart");
        }
      }
    } catch (err) {
      alert(error.response?.data?.message || "カート追加中にエラーが発生しました");
    }
  };

  const BuyNow = () => {
    if (!isLoggedIn) {
      alert("ログイン後に実行してください"); //비회원 주문 탭필요
      return;
    }
    const items = singleProductToItems(product, quantity);
    alert(`「${product.name}」${quantity}個を購入します。購入ページへ移動します。`);
    navigate("/buy", { state: { items } });
  };

  const formatPrice = (price) => {
    return price?.toLocaleString();
  };

  const changeQuantity = (change) => {
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

    return{
        product, quantity,navigate,
        mainImage,setMainImage,
        url, error,
        formatPrice,
        changeQuantity,
        AddToCart,
        BuyNow
    };

};