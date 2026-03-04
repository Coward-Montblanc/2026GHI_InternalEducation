import api from "../api/axios";

 //お知らせ一覧取得
export const getNotices = async () => {
  const { data } = await api.get("/notices");
  return data;
};

 //お知らせ詳細
export const getNoticeDetail = async (id) => {
  const { data } = await api.get(`/notices/${id}`);
  return data;
};

 //お知らせ登録
export const createNotice = async (data) => {
  const { data: res } = await api.post("/notices", data);
  return res;
};

 //お知らせ更新
export const updateNotice = async (id, data) => {
  const { data: res } = await api.put(`/notices/${id}`, data);
  return res;
};

 //お知らせ削除
export const deleteNotice = async (id) => {
  const { data } = await api.delete(`/notices/${id}`);
  return data;
};
