import {
  Box,
  Button,
  ButtonGroup,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

const categories = ["カテゴリー", "全商品", "人気商品", "イベント", "お知らせ"];

function Category() {
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    if (searchText.trim()) {
      console.log("検索:", searchText);
      // 나중에 실제 검색 기능 구현
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    
    <Box sx={{ width: "50", p: 3 }}>
      {/* 検索 */}
      <Box sx={{ mb: 3 }}>
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

      {/* カテゴリー */}
      <ButtonGroup
        variant="text"
        fullWidth
        aria-label="category button group"
      >
        {categories.map((c) => (
          <Button key={c} sx={{ flex: 1 }}>
            {c}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}

export default Category;