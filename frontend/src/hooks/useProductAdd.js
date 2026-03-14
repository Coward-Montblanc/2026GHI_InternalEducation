import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../services/CategoryService";
import { createProduct } from "../services/ProductService";

//메인서브/디테일 따로따로 불러오니 위에 선언하는거로 변경
const MAX_SIZE  = 250 * 1024;
const MAX_COUNT = 5;

export const useProductFiles = () => {
  const [selectedFiles, setSelectedFiles]             = useState([]);
  const [selectedDetailFiles, setSelectedDetailFiles] = useState([]);

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (selectedFiles.length + newFiles.length > MAX_COUNT) {
      alert(`イメージは${MAX_COUNT}枚までアップロードできます。`);
      e.target.value = "";
      return;
    }
    for (const file of newFiles) {
      if (file.size > MAX_SIZE) {
        alert("サイズが250KBを超えています。");
        e.target.value = "";
        return;
      }
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleDetailFileChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (selectedDetailFiles.length + newFiles.length > MAX_COUNT) {
      alert(`詳細画像は${MAX_COUNT}枚までアップロードできます。`);
      e.target.value = "";
      return;
    }
    for (const file of newFiles) {
      if (file.size > MAX_SIZE) {
        alert("サイズが250KBを超えています。");
        e.target.value = "";
        return;
      }
    }
    setSelectedDetailFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  return { selectedFiles, selectedDetailFiles, handleFileChange, handleDetailFileChange };
};

export const useProductAdd = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [product, setProduct] = useState({
        category_id: "",
        name: "",
        description: "",
        price: "",
        stock: "",
    });

    //저장 / 수정 두가지로
    const { selectedFiles, selectedDetailFiles, handleFileChange, handleDetailFileChange } = useProductFiles();
    const [loading ,setLoading] = useState(true);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) {
          setProduct(prev => ({ ...prev, category_id: data[0].category_id }));
        }
      } catch (err) {
        console.error("カテゴリー読み込み失敗:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);
  
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  
  // product 객체에서 각각의 값을 꺼내서 append 해야 함
  formData.append("category_id", product.category_id);
  formData.append("name", product.name);
  formData.append("description", product.description);
  formData.append("price", product.price);
  formData.append("stock", product.stock);

  // 파일 추가
  selectedFiles.forEach((file) => {
    formData.append("images", file);
  });
  selectedDetailFiles.forEach((file) => { //role3으 이미지도 추가
    formData.append("detail_images", file);
  });
  //console.log("실제 파일 객체 확인:", selectedFiles);
  try {
    const res = await createProduct(formData);
    if (res.success) {
      alert("商品が登録されました。");
      navigate("/");
    }
  } catch (err) {
    console.error("エラーコード:", err.response?.data);
  }
  };

  return {
    categories,
    product,
    selectedFiles,
    selectedDetailFiles,
    handleChange,
    handleFileChange,
    handleDetailFileChange,
    handleSubmit,
  };
};