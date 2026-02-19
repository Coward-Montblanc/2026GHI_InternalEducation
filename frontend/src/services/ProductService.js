import api from "../api/axios";

export const getProducts = async (page, limit, searchText) => { // 페이지네이션과 검색어를 쿼리로 전달
  let url = `/products?page=${page}&limit=${limit}`;
  if (searchText) url += `&search=${encodeURIComponent(searchText)}`;
  const { data } = await api.get(url);
  return data;
};


//카테고리별 상품 조회
export const getProductsByCategory = async (categoryId, searchText) => { // 카테고리별 상품 조회, 검색어를 쿼리로 전달
  let url = `/products/category/${categoryId}`; //카테고리 아이디
  if (searchText) url += `?search=${encodeURIComponent(searchText)}`;
  const { data } = await api.get(url);
  return data;
};


export const getPopularProducts = async () => {
  const { data: popular } = await api.get("/products/popular");
  const { data: searchedRes } = await api.get("/products", { params: { search: "人気商品" } });
  const searched = searchedRes.products || []; // 배열만 추출

  // 중복 제거
  const merged = [...popular, ...searched].filter(
    (item, idx, arr) => arr.findIndex(i => i.product_id === item.product_id) === idx
  );
  return merged;
};

//상품 상세 조회 
export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

//상품 등록
export const createProduct = async (formData) => {
  const { data } = await api.post("/products", formData);
  return data;
};

