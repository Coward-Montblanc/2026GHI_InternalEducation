import { useState, useEffect } from "react";
import { getProductById } from "../services/ProductService";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart } from "../services/CartService";
import { BuyPageSingle } from '../services/OrderService.js';
import { storage } from "../utils/storage"; //스토리지
import { getFallbackImageUrl } from "../services/ProductService";

export const useProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const url = import.meta.env.VITE_API_URL;
  const fallbackImage = getFallbackImageUrl(url);
  const [mainImage, setMainImage] = useState(fallbackImage);

  const user = storage.get("user"); // 로그인 정보 확인
  const isLoggedIn = !!storage.get("token"); // 로그인 상태 확인
  useEffect(() => {
    const getProductDetail = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data.images?.length) {
          const main = data.images.find((i) => i.role === 1) || data.images[0];
          setMainImage(`${url}${main.image_url}`);
        } else {
          setMainImage(getFallbackImageUrl(url)); //이미지가 없다면 fallback을 불러옴
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
    alert(`「${product.name}」${quantity}個を購入します。購入ページへ移動します。`);
    BuyPageSingle(navigate, product, quantity);
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
        fallbackImage,
        formatPrice,
        changeQuantity,
        AddToCart,
        BuyNow
    };

};