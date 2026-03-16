import {
  Box, Button, ButtonGroup,
  TextField, InputAdornment,
  IconButton, Tabs, Tab,
  Collapse, Paper,
  FormControl, Select, MenuItem
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCategories } from "../services/CategoryService";

const menuItems = ["全商品", "人気商品", "イベント", "お知らせ"];

function Category({ onCategoryChange, onSearch, onCategoryNameChange }) {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState([]);
  //setSelectedCategoryName는 MainPage에서 props로 받음
  const [showTabs, setShowTabs] = useState(false);
  //selectedTab, setSelectedTab은 카테고리 탭, searchCategory, setSearchCategory은 검색창의 카테고리
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchCategory, setSearchCategory] = useState(0);
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const categoryId = searchParams.get("category");
    
    if (categoryId && categories) { //카테고리 ID에 따라 카테고리 검색
      const currentCategory = categories.find(c => String(c.category_id) === String(categoryId));
      
      if (currentCategory) {// 해당 카테고리로 이름 변경
        onCategoryNameChange(currentCategory.name);
      }
    } else if (!categoryId) {//카테고리 값이 비거나 없으면 기본으로
      onCategoryNameChange("カテゴリー");
    }
  }, [searchParams, categories, onCategoryNameChange]);

  const triggerSearch = (catId, term) => {
    if (onSearch) {
      onSearch({
        category_id: catId, // null이면 전체검색, 값이 있으면 카테고리검색
        name: term.trim()   // 검색어
      });
    }
  };

  const refreshToAllProducts = () => {
    setSearchText(""); 
    setSelectedTab(0);
    if (onCategoryNameChange) onCategoryNameChange("カテゴリー");
    navigate("/");
    triggerSearch(null, ""); 
    setShowTabs(false);
  };

  // カテゴリーAPIから取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
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
    const selectedIndex = typeof newValue === 'number' ? newValue : event.target.value; //검색창 카테고리에서 받아올 때.
    if (typeof selectedIndex !== 'number') return;

    setSelectedTab(selectedIndex);

    const newCatId = selectedIndex === 0 ? null : categories[selectedIndex - 1].category_id;
    const newCatName = selectedIndex === 0 ? "カテゴリー" : categories[selectedIndex - 1].name; //카테고리 이름, 아무것도없으면 カテゴリー로표기
    
    if (onCategoryNameChange) onCategoryNameChange(newCatName);
    
    triggerSearch(newCatId, searchText); // 카테고리는 바꾸되 검색어는 유지

    setShowTabs(false);
  };
  const handleSearchCategoryChange = (event) => {
  setSearchCategory(event.target.value);
  };

  const handlePopularProducts = () => { //인기상품 탭
    if (onCategoryNameChange) onCategoryNameChange("人気商品");
    setSelectedTab(0);
    if (onCategoryChange) onCategoryChange(null);
    if (onSearch) onSearch("人気商品");
    setShowTabs(false); // 드롭다운 닫기
  };
  const handleSearch = () => {
    const currentCatId = searchCategory === 0 ? null : categories[searchCategory - 1].category_id;
    triggerSearch(currentCatId, searchText);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") { handleSearch(); }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* 検索 */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', width: '60%', gap: 0 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={searchCategory}
            onChange={handleSearchCategoryChange} 
            sx={{ 
              width :'160px',
              borderTopLeftRadius: 12, 
              borderBottomLeftRadius: 12,
              backgroundColor: '#fdfdfd' 
            }}
          >
            <MenuItem value={0}>全商品</MenuItem>
              {categories.map((cat, index) => (
              <MenuItem key={cat.category_id} value={index + 1}>
                {cat.name}
              </MenuItem>
              ))
              }
          </Select>
        </FormControl>
          <TextField
            fullWidth
            size="small"
            placeholder="商品を検索してください"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{ 
            '& .MuiOutlinedInput-root': { 
              borderTopRightRadius: 12, 
              borderBottomRightRadius: 12,
              } 
            }}
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
        <Button sx={{ flex: 1 }} onClick={handlePopularProducts}> {/*인기상품 함수 가져옴*/}
          人気商品
        </Button>
        {/* 기타 메뉴 */}
        {menuItems.slice(2).map((item) => (
          <Button key={item} sx={{ flex: 1 }} onClick={() => {
            if (onCategoryNameChange) onCategoryNameChange(item);
            if (item === "イベント") navigate("/event");
            if (item === "お知らせ") navigate("/notice");
            setShowTabs(false); // 드롭다운 닫기
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
            <Tab
              label="全商品"
              onClick={() => {
                // 검색/人気商品 등으로 탭 값이 이미 0일 때는 onChange가 안 불리므로, 全商品 클릭 시 항상 전상품으로 초기화
                refreshToAllProducts();
              }}
            />
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
