import api from "../api/axios";

 //イベント一覧取得
export const getEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

 //イベント詳細
export const getEventDetail = async (id) => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

 //イベント登録
export const createEvent = async (data) => {
  const { data: res } = await api.post("/events", data);
  return res;
};

 //イベント更新
export const updateEvent = async (id, data) => {
  const { data: res } = await api.put(`/events/${id}`, data);
  return res;
};

 //イベント削除
export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};
