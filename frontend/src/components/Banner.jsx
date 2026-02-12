import { Box, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useState } from "react";


const url = import.meta.env.VITE_API_URL;

function Banner() {
  const images = [
    `${url}/uploads/Banner1.png`,
    `${url}/uploads/Banner2.png`,
    `${url}/uploads/Banner3.png`
  ];
  const [index, setIndex] = useState(0);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box //사진이 들어갔지만 사진이 안뜰때를 대비한 박스
      sx={{
        position: 'relative',
        height: 400,
        width: "100%",
        backgroundColor: "#c3c3c3",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
    >
      <img
        src={images[index]}
        alt={`배너${index + 1}`}
        style={{ width: "100%", height: "100%", transition: 'all 0.5s' }} //트랜지네이션은 애니메이션 효과
      />
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)', //세로 중앙
          color: 'white',
          background: 'rgba(0,0,0,0.3)', //색 투명도 낮을수록 투명
          '&:hover': { background: 'rgba(0,0,0,0.5)' } //마우스를 올렸을 때
        }}
        aria-label="前"
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          background: 'rgba(0,0,0,0.3)',
          '&:hover': { background: 'rgba(0,0,0,0.5)' }
        }}
        aria-label="次"
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
}

export default Banner;
