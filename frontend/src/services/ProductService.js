import api from "../api/axios";

export const getProducts = async (page, limit, searchText) => { //쿼리 전달 후 params로 변경
  try {
    const params = { page, limit };
    if (searchText) params.search = searchText;
    const { data } = await api.get("/products", { params });
    return data;
  } catch (error) {
    console.error("상품 목록 조회 에러:", error);
    throw error;
  }
};


//카테고리별 상품 조회
export const getProductsByCategory = async (categoryId, searchText) => { // 카테고리별 상품 조회, 검색어를 쿼리로 전달
  try {
    const params = searchText ? { search: searchText } : {};
    const { data } = await api.get(`/products/category/${categoryId}`, { params });
    return data;
  } catch (error) {
    console.error("カテゴリー別商品取得エラー:", error);
    throw error;
  }
};


export const getPopularProducts = async () => {
  try {
    const { data: popular } = await api.get("/products/popular");
    const { data: searchedRes } = await api.get("/products", { params: { search: "人気商品" } });
    const searched = searchedRes.products || []; // 배열만 추출

    // 중복 제거
    const merged = [...popular, ...searched].filter(
      (item, idx, arr) => arr.findIndex(i => i.product_id === item.product_id) === idx
    );
    return merged;
  } catch (error) {
    console.error("人気商品取得エラー:", error);
    throw error;
  }
};

//상품 상세 조회 
export const getProductById = async (id) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (error) {
    console.error("商品詳細取得エラー:", error);
    throw error;
  }
};

//상품 등록
export const createProduct = async (formData) => {
  try {
    const { data } = await api.post("/products", formData);
    return data;
  } catch (error) {
    console.error("商品登録エラー:", error);
    throw error;
  }
};

