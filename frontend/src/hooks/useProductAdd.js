import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../services/CategoryService";
import { createProduct } from "../services/ProductService";

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

    const [selectedFiles, setSelectedFiles] = useState([]);
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
    if(e.target.files){
      const newfile = Array.from(e.target.files);
    }
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => { // 파일 선택 시 호출되는 함수
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const MAX_SIZE = 250 * 1024; // 250KB
      const MAX_COUNT = 5;

      
      if (selectedFiles.length + newFiles.length > MAX_COUNT) { // 개수 체크
        alert(`イメージは ${MAX_COUNT}枚までアップロードできます.`);
        e.target.value = ""; 
        return;
      }

      for (let file of newFiles) { // 용량확인
        if (file.size > MAX_SIZE) {
          alert(`サイズが 250KBを超えています.`);
          e.target.value = "";
          return;
        }
      }
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      e.target.value = "";// 연속해서 같은 파일을 선택할 수 있도록 인풋 초기화
    }
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

  return{
    categories,
    product,
    selectedFiles,
    handleChange,
    handleFileChange,
    handleSubmit
  };
};