import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../services/LoginService";

export const useSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login_id: "",
    password: "",
    passwordConfirm: "",
    name: "",
    email: "",
    phone: "",
    zip_code: "",
    address: "",
    address_detail: "",
    role: "USER"
  });

  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("naver.com");
  const [customDomain, setCustomDomain] = useState(""); // 직접 입력한 도메인 저장용
  const [open, setOpen] = useState(false);


  const fetchJapaneseAddress = async (zipCode) => { //일본 우편번호 검색하는 함수
    const cleanZip = zipCode.replace('-', ''); //7자리 숫자로만 우편번호 검색
    if (cleanZip.length !== 7) return; 

    try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`); //api주소
        const data = await response.json();
        if (data.results) {
            const res = data.results[0];
            const fullAddr = `${res.address1}${res.address2}${res.address3}`;
            setFormData(prev => ({
                ...prev,
                address: fullAddr,
                zip_code: cleanZip
            }));
        } else {
            alert("該当する住所が見つかりませんでした。");
        }
    } catch (error) {
        console.error("Address fetch error:", error);
    }
	};

  //제약 조건 (영문+숫자 혼합, 4자 이상)
  const validateFormat = (value) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{4,}$/;
    return regex.test(value);
  };

  // 入力値変更ハンドラー
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  // 登録ボタンクリック時にバックエンド呼び出し
  const handleSignup = async () => {
    const finalDomain = emailDomain === "custom" ? customDomain : emailDomain; //이메일 도메인부분 직접 입력을 클릭하는지에 따라 바뀜.
    const fullEmail = `${emailId}@${finalDomain}`;
    
    if (!emailId || !finalDomain) { 
      alert("ドメインを選択してください。");
      return;
    }
    if (emailDomain === "custom" && !customDomain) { //도메인을 비우고 가입할 경우
      alert("ドメインを選択または入力してください。");
      return;
    }

    if (!validateFormat(formData.login_id)) { //아이디,비밀번호 제약
      alert("IDは英文と数字を含む4文字以上にしてください。");
      return;
    }
    if (!validateFormat(formData.password)) {
      alert("パスワードは英文と数字を含む4文字以上にしてください。");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert("パスワードが一致しません。");
      return;
    }
    if (!emailId) {
      alert("メールアドレスを入力してください。");
      return;
    }

    try {
      const response = await signupApi({
        login_id: formData.login_id,
        password: formData.password,
        name: formData.name,
        email: fullEmail,
        phone: formData.phone,
        zip_code: formData.zip_code,
        address: formData.address,
        address_detail: formData.address_detail,
        role: formData.role,
      });

      if (response.status === 201) {
        alert("会員登録に成功しました。");
        navigate("/"); // メイン画面に移動
      }
    } catch (error) {
      console.error("会員登録エラー:", error);
      alert(error.response?.data?.message || "サーバーエラーが発生しました。");
    }
  };



  return {
  formData, 
  emailId, setEmailId, 
  emailDomain, setEmailDomain,
  customDomain, setCustomDomain, 
  open, setOpen,
  handleChange, 
  fetchJapaneseAddress,
  handleSignup
    };
};