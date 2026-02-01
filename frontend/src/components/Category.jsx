import {
  Box,
  Button,
  ButtonGroup,
  TextField,
} from "@mui/material";

const categories = ["카테고리", "전체상품", "인기상품", "이벤트", "공지사항"];

function Category() {
  return (
    
    <Box sx={{ width: "50", p: 3 }}>
      {/* 검색창 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="상품을 검색하세요"
        />
      </Box>

      {/* 카테고리 버튼 */}
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
