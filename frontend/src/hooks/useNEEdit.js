import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNoticeDetail, updateNotice, uploadImage, deleteImage } from "../services/NoticeService";
import { getEventDetail, updateEvent } from "../services/EventService";
export const useNEEdit = (type = "notice", id) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [initialContent, setInitialContent] = useState("");

  const [data, setData] = useState({
    title: "",
    content: "",
    is_pinned: 0,
    is_banner: 0,
    banner_start_at: "",
    banner_end_at: "",
    banner_priority: 1,
    banner_link_url: ""
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [existingImages, setExistingImages] = useState({ thumb: "", banner: "" });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = (type === "notice") 
          ? await getNoticeDetail(id) 
          : await getEventDetail(id);
        
        const item = (type === "notice") ? res.notice : res.event;

        if (item) {
          const fetchedContent = item.content || "";
          setData({
            title: item.title,
            content: item.content,
            is_pinned: item.is_pinned,
            is_banner: item.is_banner,
            banner_start_at: item.banner_start_at ? item.banner_start_at.slice(0, 16) : "",
            banner_end_at: item.banner_end_at ? item.banner_end_at.slice(0, 16) : "",
            banner_priority: item.banner_priority || 1,
            banner_link_url: item.banner_link_url || ""
          });
          setInitialContent(fetchedContent);
          setExistingImages({
            thumb: item.thumbnail_path || "",
            banner: item.banner_path || ""
          });
        }
      } catch (err) {
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  const getFilesFromHtml = (html) => {
    if (!html) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imgs = Array.from(doc.querySelectorAll('img'));

    return imgs
      .map(img => {
        const src = img.getAttribute('src');
      
        if (!src || src.startsWith('data:') || src.includes(';base64,')) return null;

        const dataFilename = img.getAttribute('data-filename');
        if (dataFilename) return dataFilename;

        const parts = src.split('/');
        const fileName = parts.pop();
      
        return fileName.includes('.') ? fileName : null;
      })
      .filter(name => name !== null);
  };
  
  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? (checked ? 1 : 0) : value
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
    if (!window.confirm("この内容で更新しますか？")) return;

    try {
      setSubmitting(true);

      const updatedContent = await processEditorImages(data.content);

      const oldFiles = getFilesFromHtml(initialContent);
      const newFiles = getFilesFromHtml(updatedContent);
      const deletedFiles = oldFiles.filter(file => !newFiles.includes(file));

      if (deletedFiles.length > 0) {
        try {
          await deleteImage(deletedFiles);
        } catch (err) {
          console.error("サーバーファイルの削除中にエラーが発生しました。", err);
        }
      }

      const formData = new FormData();
      const finalData = { ...data, content: updatedContent };
      Object.keys(finalData).forEach(key => formData.append(key, finalData[key]));

      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (bannerFile) formData.append("banner_image", bannerFile);

      if (type === "notice") await updateNotice(id, formData);
      else await updateEvent(id, formData);

      alert("更新が完了しました。");
      navigate(`/${type}/${id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "更新に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const processEditorImages = async (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const imgs = doc.querySelectorAll('img');

    for (const img of imgs) {
      const src = img.getAttribute('src') || '';
      img.style.outline = 'none';

      if (src.startsWith('data:')) {
        const savedAttributes = {};
        for (const attr of img.attributes) {
          savedAttributes[attr.name] = attr.value;
        }
        
        const file = base64ToFile(src, `edit_img_${Date.now()}`);
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

          if (!img.getAttribute('style') && !img.getAttribute('width')) {
          img.style.width = '100%';
          img.style.height = 'auto';
          }
        } catch (err) { 
          console.error("画像のアップロード中にエラーが発生しました。", err); 
        }
      }
    }
    return doc.body.innerHTML;
  };

  const base64ToFile = (base64, filename) => {
  const arr = base64.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  
  let extension = 'png';
  if (mime.includes('svg')) {
    extension = 'svg';
  } else {
    extension = mime.split('/')[1] || 'png';
  }

  const safeFilename = filename.split('.')[0] + '.' + extension;

  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], safeFilename, { type: mime });
};

  return {
    data, thumbnail, bannerFile, existingImages,
    loading, submitting, error,
    handleChange, handleFileChange, handleSubmit, setData
  };
};