import { Box, Typography } from "@mui/material";

function Banner() {
  return (
    <Box
      sx={{
        height: 300,
        width: "100%",
        backgroundColor: "#c3c3c3",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4">Banner</Typography>
    </Box>
  );
}

export default Banner;
