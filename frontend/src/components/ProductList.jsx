import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";

const products = [
  { id: 1, name: "스마트 TV", price: "1,200,000원" },
  { id: 2, name: "냉장고", price: "980,000원" },
  { id: 3, name: "세탁기", price: "760,000원" },
  { id: 4, name: "에어컨", price: "1,500,000원" },
  { id: 5, name: "스마트 TV", price: "1,200,000원" },
  { id: 6, name: "냉장고", price: "980,000원" },
  { id: 7, name: "세탁기", price: "760,000원" },
  { id: 8, name: "에어컨", price: "1,500,000원" },
  { id: 9, name: "세탁기", price: "760,000원" },
  { id: 10, name: "에어컨", price: "1,500,000원" },
  { id: 11, name: "세탁기", price: "760,000원" },
  { id: 12, name: "에어컨", price: "1,500,000원" }
];

function ProductList() {
  return (
    <Grid
      container
      spacing={6}
      justifyContent="center"
      sx={{ p: 3 }}
    >
      {products.map((p) => (
        <Grid item xs={12} sm={6} md={4} key={p.id}>
          <Card
            sx={{
              height: "100%",
              width: "200px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 이미지 영역 (4:3 비율) */}
            <Box
              sx={{
                width: "100%",
                aspectRatio: "4 / 3",
                backgroundColor: "#eee",
              }}
            />

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{p.name}</Typography>
              <Typography color="text.secondary">
                {p.price}
              </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
              <Button variant="contained">장바구니</Button>
              <Button variant="contained">바로 구매</Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default ProductList;
