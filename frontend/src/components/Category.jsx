import {
  Box, Button, ButtonGroup,
  TextField, InputAdornment,
  IconButton, Tabs, Tab, Badge,
  Collapse, Paper,
  FormControl, Select, MenuItem
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // 추가
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCategories } from "../services/CategoryService";
import { useAuth } from "../contexts/AuthContext"; // 로그인 상태를 가져옴
import { getCart } from "../services/CartService";

const menuItems = ["全商品", "人気商品", "イベント", "お知らせ"];

function Category({ onCategoryChange, onSearch, onCategoryNameChange }) {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState([]);
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
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

  const handleLogout = () => {
    logout();
    alert("ログアウトしました。");
    navigate("/");
  };

  const handleMypage = () => {
    navigate("/mypage");
  };

  // カテゴリーAPIから取得
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const responseData = await getCategories();
      if (responseData && responseData.categories) {
        setCategories(responseData.categories);
      } else {
        setCategories([]);
      }
      
    } catch (error) {
      console.error("カテゴリー取得エラー:", error);
      setCategories([]);
    }
  };
  fetchCategories();
}, []);

  const fetchCartCount = async () => { //カートボタン+数字表示
      if (user?.login_id) {
        try {
          const cart = await getCart(user.login_id);
          setCartCount(Array.isArray(cart) ? cart.length : 0);
        } catch (err) {
          console.error("Cart error:", err);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
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

  useEffect(() => {
  fetchCartCount();
}, [user?.login_id, location.pathname]);

  const handleCategoryClick = () => {
    setShowTabs(!showTabs);
  };

  const handleTabChange = (event, newValue) => {
    const selectedIndex = typeof newValue === 'number' ? newValue : event.target.value;
    if (typeof selectedIndex !== 'number') return;

    setSelectedTab(selectedIndex);

    const newCatId = selectedIndex === 0 ? null : categories[selectedIndex - 1].category_id;
    const newCatName = selectedIndex === 0 ? "カテゴリー" : categories[selectedIndex - 1].name;
    
    if (onCategoryNameChange) onCategoryNameChange(newCatName);
    
    triggerSearch(newCatId, searchText);

    setShowTabs(false);
  };
  const handleSearchCategoryChange = (event) => {
  setSearchCategory(event.target.value);
  };

  //人気商品タブ
  const handlePopularProducts = () => { 
    if (onCategoryNameChange) onCategoryNameChange("人気商品");
    setSelectedTab(0);
    if (onCategoryChange) onCategoryChange(null);
    if (onSearch) onSearch("人気商品");
    setShowTabs(false); 
  };
  const handleSearch = () => {
    const currentCatId = searchCategory === 0 ? null : categories[searchCategory - 1].category_id;
    triggerSearch(currentCatId, searchText);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") { handleSearch(); }
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
        <Box sx={{ 
          maxWidth: "1000px", 
          mx: "auto", 
          px: 2,
          py: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
      {/* 検索 */}
      <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'left', gap: 1 }}>
        <Box sx={{ display: 'flex', width: '100%', maxWidth: '1000px', gap: 0 }}>
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
            size="small"
            placeholder="商品を検索してください"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{ 
              width :'600px',
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
        {user ? (
          <>
            <IconButton color="primary" onClick={() => navigate("/cart")}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <Button size="small" sx={{ fontWeight: 700, color: '#4a5568' }} onClick={() => navigate("/mypage")}>
              マイページ
            </Button>
            <Button size="small" color="inherit" onClick={handleLogout}>
              ログアウト
            </Button>
          </>
        ) : (
          <>
            <Button size="small" onClick={() => navigate("/login")}>ログイン</Button>
            <Button size="small" variant="outlined" onClick={() => navigate("/signup")} sx={{ borderRadius: 2 }}>
              会員登録
            </Button>
          </>
        )}
        </Box>
      </Box>

      {/* カテゴリー */}
      <Paper 
          variant="outlined" 
          sx={{ 
            width: "100%", 
            borderRadius: 3, 
            overflow: "hidden", 
            border: "1px solid #e0e4ec", 
            mb: 1,
            bgcolor: '#ffffff'
          }}
      >
      {/* トップボタングループ */}
      <ButtonGroup
        variant="text"
        fullWidth
        aria-label="category button group"
        sx={{
          borderBottom: showTabs ? '1px solid #e0e4ec' : 'none',
          '& .MuiButton-root': {
            py: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#4a5568',
            '&:hover': { bgcolor: '#f8faff' },
            '&:not(:last-child)': { borderRight: '1px solid #f0f2f5' }
          }
        }}
      >
        <Button 
          onClick={handleCategoryClick}
          sx={{ flex: 1 }}
          endIcon={showTabs ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        >
          カテゴリー
        </Button>

        <Button sx={{ flex: 1 }} onClick={handlePopularProducts}>
          人気商品
        </Button>

        {menuItems.slice(2).map((item) => (
          <Button key={item} sx={{ flex: 1 }} onClick={() => {
            if (onCategoryNameChange) onCategoryNameChange(item);
            if (item === "イベント") navigate("/event");
            if (item === "お知らせ") navigate("/notice");
            setShowTabs(false);
          }}>
            {item}
          </Button>
        ))}
      </ButtonGroup>

      <Collapse in={showTabs}>
        <Box sx={{ bgcolor: '#fafbfc' }}> 
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1,
              minHeight: 52,
              "& .MuiTab-root": {
                minHeight: 52,
                textTransform: "none",
                fontSize: "0.9rem",
                color: '#718096',
                fontWeight: 500,
              },
              "& .Mui-selected": {
                color: '#3f51b5 !important',
                fontWeight: "800 !important",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: '#3f51b5',
              },
            }}
          >
            <Tab
              label="全商品"
              onClick={() => refreshToAllProducts()}
            />
            {categories.map((category) => (
              <Tab key={category.category_id} label={category.name} />
            ))}
          </Tabs>
        </Box>
      </Collapse>
    </Paper>
    </Box>
  </Box>
 );
}

export default Category;
