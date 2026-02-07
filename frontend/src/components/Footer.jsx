import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box sx={{ p: 4, textAlign: "", backgroundColor: "#f5f5f5" }}>
      <Typography variant="body2">
        サイト情報 <br/>
        代表者 : OOO<br/>
        © 2026 GHI_InternalEducation.
      </Typography>
    </Box>
  );
}

export default Footer;
