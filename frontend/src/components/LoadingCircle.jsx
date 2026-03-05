import { Box, CircularProgress } from "@mui/material";

export const LoadingView = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <CircularProgress />
  </Box>
);


export default LoadingView;