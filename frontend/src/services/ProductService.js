import api from "../api/axios";

export const getProducts = async (page, limit, searchText) => { //クエリ配信後にparamsに変更
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

//管理者条件に読み込む
export const getAdminProducts = async (searchParams) => {
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

//管理者商品管理ページの推奨ボタンをクリックしたときの状態変更
export const updateRecommendStatus = async (productId, isRecommended) => { 
  try {
    const { data } = await api.patch(`/products/admin/${productId}/recommend`, {
      is_recommended: Number(isRecommended)
    });
    return data;
  } catch (error) {
    console.error("おすすめ状態変更エラー:", error);
    throw error;
  }
};

//カテゴリ別商品照会
export const getProductsByCategory = async (categoryId, searchText) => { //カテゴリ別の商品検索、クエリをクエリに渡す
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
    const searched = searchedRes.products || [];

    const merged = [...popular, ...searched].filter(
      (item, idx, arr) => arr.findIndex(i => i.product_id === item.product_id) === idx
    );
    return merged;
  } catch (error) {
    console.error("人気商品取得エラー:", error);
    throw error;
  }
};

//商品詳細照会 
export const getProductById = async (id) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (error) {
    console.error("商品詳細取得エラー:", error);
    throw error;
  }
};

// 商品修正(テキスト+イメージ FormData)
export const updateProduct = async (id, formData) => {
  try {
    const { data } = await api.put(`/products/${id}`, formData);
    return data;
  } catch (error) {
    console.error("商品修正エラー:", error);
    throw error;
  }
};

//商品登録
export const createProduct = async (formData) => {
  try {
    const { data } = await api.post("/products", formData);
    return data;
  } catch (error) {
    console.error("商品登録エラー:", error);
    throw error;
  }
};

//商品画像なし/ロードに失敗したときの基本画像を設定する（backend/image_list/No_Image.png
export function getFallbackImageUrl(baseUrl) {
  const url = (baseUrl || "").replace(/\/$/, ""); 
  return `${url}/image_list/No_Image.png`;
}

//チェックされた商品の在庫切れに変更
export const bulkUpdateProductStatus = async (ids, status) => {
  try {
    const { data } = await api.patch("/products/admin/bulk-status", { ids, status });
    return data;
  } catch (error) {
    console.error("ステータス変更エラー：", error);
    throw error;
  }
};
