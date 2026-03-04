//공지·이벤트 목록/상세, 주문 목록 등에서 공통 사용
//로컬 표시에서 변환하려는 목적이기에 유저가입일등에는 사용하지 않았습니다. 
//마이페이지에서 가입일 표시할 경우 사용 가능

export const formatDate = (dateStr, emptyValue = "") => {
  if (!dateStr) return emptyValue;
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
