import { Typography, Paper, Button, Divider } from "@mui/material";
import { useWithdraw } from "../hooks/useWithdraw";

function MyWithdraw(){
  const { withdraw } = useWithdraw();

  return (
    <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
        <Typography variant="h6" fontWeight={700} color="error" gutterBottom>
            会員脱退
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ my: 3 }}>
            退会すると復旧できず、すべての注文履歴を確認できなくなります。<p/>
            本当に脱退しますか？
        </Typography>
        <Button 
            variant="contained" 
            color="error" 
            onClick={() => {
            if(window.confirm("本当に脱退しますか？")) withdraw();
            }}
            sx={{ borderRadius: 2, px: 4 }}
        >
            退会する
        </Button>
    </Paper>
  );
}

export default MyWithdraw;