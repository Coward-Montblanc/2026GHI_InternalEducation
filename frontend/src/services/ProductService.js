import api from "../api/axios";

export const getProducts = async (page, limit, searchText) => { //쿼리 전달 후 params로 변경
  try {
    const params = { page, limit };
    if (searchText) params.search = searchText;
    const { data } = await api.get("/products", { params });
    return data;
  } catch (error) {
    console.error("管理者商品一覧取得エラー:", error);
    throw error;
  }
};

//관리자 조건으로 불러오기
export const getAdminProducts = async (searchParams) => {//객체로 받아서 불러옴
  try {
    const { data } = await api.get("/products/admin/all", { 
      params: searchParams 
    });
    return data;
  } catch (error) {
    console.error("管理者商品一覧取得エラー:", error);
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

// 상품 수정 (텍스트 + 이미지 FormData)
export const updateProduct = async (id, formData) => {
  try {
    const { data } = await api.put(`/products/${id}`, formData);
    return data;
  } catch (error) {
    console.error("商品修正エラー:", error);
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

// 상품 이미지 없음/로드 실패 시 기본 이미지를 설정 (backend/image_list/sample1.png 세탁기 사진 사용)
export function getFallbackImageUrl(baseUrl) {
  const url = (baseUrl || "").replace(/\/$/, ""); //슬래시 제거하고 반환
  return `${url}/image_list/sample1.png`;
}
