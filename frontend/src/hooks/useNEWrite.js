import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNotice } from "../services/NoticeService";
import { createEvent } from "../services/EventService";
export const useNEWrite = (type = "notice") => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [data, setData] = useState({
    title: "",
    content: "",
    is_pinned: 0,
    is_banner: 0,
    banner_start_at: new Date().toISOString().slice(0, 16),
    banner_end_at: "",
    banner_priority: 1,
    banner_link_type: "auto",
    banner_link_url: ""
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleLinkTypeChange = (e) => {
    const type = e.target.value;
    setData(prev => ({ 
      ...prev, 
      banner_link_type: type,
      banner_link_url: type === "auto" ? "" : prev.banner_link_url 
    }));
  };

  const handleFileChange = (e, role) => {
    const file = e.target.files[0];
    if (!file) return;
    if (role === 'thumb') {
      setThumbnail(file);
    } else if (role === 'banner') {
      setBannerFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title.trim() || !data.content.trim()) {
      setError("タイトルと本文を入力してください。");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const updatedContent = await processEditorImages(data.content);

      const formData = new FormData();
      
      const finalData = { ...data, content: updatedContent };
      Object.keys(finalData).forEach(key => formData.append(key, finalData[key]));
      
      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (bannerFile) formData.append("banner_image", bannerFile);

      if (type === "notice") {
      await createNotice(formData);
      } else if (type === "event") {
      await createEvent(formData); 
      }

      alert(`${type === "notice" ? "お知らせ" : "イベント"}が正常に登録されました。`);
      navigate(`/${type}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "登録に失敗しました.");
    } finally {
      setSubmitting(false);
    }
  };

  const processEditorImages = async (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const imgs = doc.querySelectorAll('img[data-local="true"]');

    for (const img of imgs) {
      const src = img.getAttribute('src') || '';
      img.style.outline = 'none';

      if (src.startsWith('data:')) {
        const savedAttributes = {};
        for (const attr of img.attributes) {
          savedAttributes[attr.name] = attr.value;
        }

        const file = base64ToFile(src, `new_img_${Date.now()}`);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        
        try {
          const response = await uploadImage(uploadFormData);
          
          img.src = response.url;
          
          Object.keys(savedAttributes).forEach(attrName => {
            if (attrName !== 'src' && attrName !== 'data-local') {
              img.setAttribute(attrName, savedAttributes[attrName]);
            }
          });

          img.removeAttribute('data-local');
          img.setAttribute('data-filename', response.fileName);
        } catch (error) {
          console.error("画像のアップロード中にエラーが発生しました。", error);
        }
      }
    }
    return doc.body.innerHTML;
  };

  const base64ToFile = (base64, filename) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    let extension = 'png';
    if (mime.includes('svg')) {
      extension = 'svg';
    } else {
      extension = mime.split('/')[1] || 'png';
    }

    const safeFilename = `${filename.split('.')[0]}.${extension}`;
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], safeFilename, { type: mime });
  };

  return {
    data, thumbnail, bannerFile, error, submitting,
    handleChange, handleFileChange, handleLinkTypeChange, handleSubmit
  };
};