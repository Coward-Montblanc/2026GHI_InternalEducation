import {
  Box,
  Button,
  ButtonGroup,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Collapse,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const menuItems = ["全商品", "人気商品", "イベント", "お知らせ"];

function Category({ onCategoryChange, onSearch, selectedCategoryName, setSelectedCategoryName, onCategoryNameChange }) {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState([]);
  // selectedCategoryName, setSelectedCategoryName는 MainPage에서 props로 받음
  const [showTabs, setShowTabs] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // カテゴリーAPIから取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("カテゴリー取得エラー:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = () => {
    setShowTabs(!showTabs);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue === 0) {
      setSelectedCategoryName("カテゴリー");
      if (onCategoryNameChange) onCategoryNameChange("カテゴリー");
      if (onCategoryChange) {
        onCategoryChange(null);
      }
      if (onSearch) {
        onSearch(""); // 인기상품 해제 시 검색어도 초기화
      }
    } else {
      const selectedCategory = categories[newValue - 1];
      if (selectedCategory) {
        setSelectedCategoryName(selectedCategory.name);
        if (onCategoryNameChange) onCategoryNameChange(selectedCategory.name);
        if (onCategoryChange) {
          onCategoryChange(selectedCategory.category_id);
        }
        if (onSearch) {
          onSearch(""); // 일반 카테고리 선택 시 검색어 초기화
        }
      }
    }
    setShowTabs(false);
  };

  const handleAllProducts = () => {
    setSelectedCategoryName("カテゴリー");
    setSelectedTab(0);
    if (onCategoryChange) {
      onCategoryChange(null);
    }
  };

  // 이전에는 콘솔에만 떴음. 검색 버튼 클릭 또는 엔터 시 상위로 검색어 전달
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchText.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* 検索 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '95%'}}>
          <TextField
            fullWidth
            size="small"
            placeholder="商品を検索してください"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* カテゴリー */}
      <ButtonGroup
        variant="text"
        fullWidth
        aria-label="category button group"
      >
        {/* 카테고리 드롭다운 */}
        <Button 
          onClick={handleCategoryClick}
          sx={{ flex: 1 }}
          endIcon={showTabs ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        >
          カテゴリー
        </Button>
        {/* 인기상품 버튼 */}
        <Button sx={{ flex: 1 }} onClick={() => {
          if (onCategoryNameChange) onCategoryNameChange("人気商品");
          setSelectedTab(-1);
          if (onCategoryChange) onCategoryChange(null); // 카테고리 해제를
          if (onSearch) onSearch("人気商品"); // sql에서 인기상품으로 검색
        }}>人気商品</Button>
        {/* 기타 메뉴 */}
        {menuItems.slice(2).map((item) => (
          <Button key={item} sx={{ flex: 1 }} onClick={() => {
            if (onCategoryNameChange) onCategoryNameChange(item);
            if (item === "イベント") navigate("/event");
            if (item === "お知らせ") navigate("/notice");
          }}>
            {item}
          </Button>
        ))}
      </ButtonGroup>

      {/* 카테고리 탭 (펼치기/접기) */}
      <Collapse in={showTabs}>
        <Paper 
          elevation={2} 
          sx={{ 
            mt: 2, 
            borderRadius: 2,
            overflow: "hidden",
            maxWidth: "1100px",      //최대 너비 지정
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontSize: "0.95rem",
              },
              "& .Mui-selected": {
                fontWeight: "bold",
              },
            }}
          >
            <Tab label="全商品" /> {/* 전체 상품만 띄우기 */}
            {categories.map((category) => (
              <Tab key={category.category_id} label={category.name} />
            ))}
          </Tabs>
        </Paper>
      </Collapse>
    </Box>
  );
}

export default Category;