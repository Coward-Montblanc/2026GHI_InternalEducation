const MSG = { //文字列を変数にして使用する
  REQUIRED: "を入力してください。",
  SELECT: "を選択してください。",
  COMPLETE: "を完了してください。",
  MISMATCH: "が一致しません。",
  FORMAT_ERROR: "*英文と数字を組み合わせて4文字以上に設定してください。"
};

export const validateFormat = (value) => {
  const regex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{4,}$/;
  return regex.test(value);
};

export const validateOrderForm = (formData, paymentMethod) => {
  let errors = {};

  if (!formData.receiver_name?.trim()) {
    errors.receiver_name = "*お名前" + MSG.REQUIRED;
  }

  if (!formData.zip_code?.trim()) {
    errors.zip_code = "*郵便番号" + MSG.REQUIRED;
  }

  if (!formData.address?.trim()) {
    errors.address = "*住所" + MSG.SELECT;
  }

  if (!formData.address_detail?.trim()) {
    errors.address_detail = "*詳細住所" + MSG.REQUIRED;
  }

  if (!formData.phone?.trim()) {
    errors.phone = "*連絡先" + MSG.REQUIRED;
  }

  if (!paymentMethod) {
    errors.payment_method = "*支払い方法" + MSG.SELECT;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSignupForm = (formData, emailData) => {
  let errors = {};
  const { emailId, emailDomain, customDomain } = emailData;

  if (!formData.name?.trim()) {
    errors.name = "*名前" + MSG.REQUIRED;
  }

  if (!formData.login_id) {
    errors.login_id = "*ID" + MSG.REQUIRED;
  } else if (!validateFormat(formData.login_id)) {
    errors.login_id = MSG.FORMAT_ERROR;
  }

  if (!formData.password) {
    errors.password = "*パスワード" + MSG.REQUIRED;
  } else if (!validateFormat(formData.password)) {
    errors.password = MSG.FORMAT_ERROR;
  }

  if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = "*パスワード" + MSG.MISMATCH;
  }

  if (!emailId || !emailDomain || (emailDomain === "custom" && !customDomain)) {
    errors.email = "*メール" + MSG.COMPLETE;
  }

  if (!formData.phone?.trim()) {
    errors.phone = "*電話番号" + MSG.REQUIRED;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};