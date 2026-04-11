import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const url = import.meta.env.VITE_API_URL;

function Banner() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get(`${url}/api/events/banners`); 
        setBanners(response.data.banners || []);
      } catch (err) {
        console.error("バナーの読み込みに失敗しました：", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [index, banners.length]);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const handleBannerClick = (banner) => {
  if (banner.banner_link_url) {
    if (banner.banner_link_url.startsWith('http')) {
      window.location.href = banner.banner_link_url;
    } else {
      navigate(banner.banner_link_url);
    }
    return;
  }
  navigate(`/${banner.type}/${banner.id}`);
};

  if (loading || banners.length === 0) {
    return <Box sx={{ height: 400, bgcolor: "#f0f0f0", width: "1000px", mx: "auto" }} />;
  }

  const currentBanner = banners[index];

  return (
    <Box
      sx={{
        position: 'relative',
        height: 400,
        mx: "auto",
        width: "1000px",
        backgroundColor: "#000",
        color: "white",
        overflow: "hidden",
        cursor: "pointer",
        borderRadius: 2, 
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}
      onClick={() => handleBannerClick(currentBanner)}
    >
      <img
        src={`${url}/uploads/${currentBanner.banner_path}`}
        alt={currentBanner.title}
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "cover", 
          transition: 'opacity 0.8s ease-in-out',
        }}
      />

      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        p: 3,
        textAlign: 'left'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {currentBanner.title}
        </Typography>
      </Box>

      <IconButton
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        sx={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'white', background: 'rgba(0,0,0,0.2)',
          '&:hover': { background: 'rgba(0,0,0,0.5)' }
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        sx={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'white', background: 'rgba(0,0,0,0.2)',
          '&:hover': { background: 'rgba(0,0,0,0.5)' }
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      <Box sx={{
        position: 'absolute',
        bottom: 16,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        gap: 1
      }}>
        {banners.map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: i === index ? 'white' : 'rgba(255,255,255,0.4)',
              transition: '0.3s'
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default Banner;