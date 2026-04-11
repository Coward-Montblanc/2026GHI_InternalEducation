import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signupApi } from "../services/LoginService";
import { fetchJapaneseAddress } from "../utils/address"; 
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { validateSignupForm } from "../utils/validation";
import { formatPhoneNumber } from "../utils/phoneFormatter";
import api from "../api/axios";

export const useSignup = () => {
  const navigate = useNavigate();
  const [emailDomains, setEmailDomains] = useState([]);
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
  const [emailDomain, setEmailDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [countryCodes, setCountryCodes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("+82");
  const [phonePlaceholder, setPhonePlaceholder] = useState('010-0000-0000');
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
  const getInitialData = async () => {
    try {
      const [domainRes, countryRes] = await Promise.all([
        api.get("/common/codes/EMAIL_DOMAIN"),
        api.get("/common/codes/PHONE_COUNTRY_CODE")
      ]);
      
      if (domainRes.data.success) setEmailDomains(domainRes.data.codes);
      if (countryRes.data.success) {
        setCountryCodes(countryRes.data.codes);
        
        const defaultCountry = countryRes.data.codes.find(c => c.value === selectedCountry);
        if (defaultCountry?.format) setPhonePlaceholder(defaultCountry.format);
      }
    } catch (error) {
      console.error("データエラー:", error);
    }
  };
  getInitialData();
}, []);

  const handlePhoneChange = (e) => {
    const cleanCountry = String(selectedCountry).replace("+", "");
    const formatted = formatPhoneNumber(e.target.value, cleanCountry);

    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) { setErrors(prev => ({ ...prev, phone: "" })); }
  };

  const handleEmailIdChange = (val) => {
    setEmailId(val);
    if (errors.email) { setErrors(prev => ({ ...prev, email: "" })); }
  };

  const handleEmailDomainChange = (val) => {
    setEmailDomain(val);
    if (errors.email) { setErrors(prev => ({ ...prev, email: "" })); }
  };

  const Address = async () => {
    try {
        const result = await fetchJapaneseAddress(formData.zip_code);
        if (result) {
            setFormData(prev => ({
                ...prev,
                address: result.address,
                zip_code: result.zip_code
            }));
            setErrors(prev => ({ ...prev, address: "", zip_code: "" }));
        } else {
            alert("該当する住所が見つかりませんでした。");
        }
    } catch (error) {
        console.error("Address fetch error:", error);
    }
	};


  // 入力値変更ハンドラー
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // 登録ボタンクリック時にバックエンド呼び出し
  const handleSignup = async () => {
    const emailData = { emailId, emailDomain, customDomain };
    const { isValid, errors: validationErrors } = validateSignupForm(formData, emailData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    const finalDomain = emailDomain === "custom" ? customDomain : emailDomain; //이메일 도메인부분 직접 입력을 클릭하는지에 따라 바뀜.
    const fullEmail = `${emailId}@${finalDomain}`;

    const pureCountry = String(selectedCountry).replace(/[^0-9]/g, "");
    const purePhone = formData.phone.replace(/[^0-9]/g, "");
    const fullPhoneNumber = `${pureCountry} ${purePhone}`;

    try {
      const response = await signupApi({
        login_id: formData.login_id,
        password: formData.password,
        name: formData.name,
        email: fullEmail,
        phone: fullPhoneNumber,
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

  const getCountryCode = (callingCode) => {
  try {
    const phoneNumber = parsePhoneNumberWithError(`${callingCode}1012345678`);
    return phoneNumber.country;
  } catch (error) {
    return null;
  }
};

  return {
  formData, 
  emailId, setEmailId, 
  emailDomain, setEmailDomain,
  emailDomains,
  customDomain, setCustomDomain,
  errors, setErrors,
  open, setOpen,
  handleChange, 
  Address,
  handleSignup,
  countryCodes, 
  selectedCountry, 
  setSelectedCountry, getCountryCode,
  phonePlaceholder, handlePhoneChange,
  handleEmailIdChange,
  handleEmailDomainChange,
    };
};