//マイページで登録日を表示する場合に利用可能

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
