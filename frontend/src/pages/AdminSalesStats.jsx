import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LoadingView } from "../components/LoadingCircle";
import dayjs from 'dayjs';
import api from "../api/axios";

function AdminSalesStats() {
  const [stats, setStats] = useState({ todaySales: 0, totalTrend: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("orders/admin/stats/sales-trend");
        const apiData = res.data.totalTrend;
        const fullTrend = [];

        for (let i = 6; i >= 0; i--) {
          const dateStr = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
          const found = apiData.find(item => item.date === dateStr);

          fullTrend.push({
            date: dateStr,
            daily_orders: found ? Number(found.daily_orders) : 0,
            daily_revenue: found ? Number(found.daily_revenue) : 0
          });
        }

        setStats({
          todaySales: res.data.todaySales,
          totalTrend: fullTrend 
        });

      } catch (err) {
        console.error("統計の読み込みに失敗しました。", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) { return ( <LoadingView /> ); }

  return (
    
    <Box sx={{ width: "100%", p: { xs: 1, md: 2 } }}>
        <Paper 
            variant="outlined" 
            sx={{ 
                p: { xs: 2, md: 4 }, 
                borderRadius: 4, 
                bgcolor: "background.paper",
                border: "1px solid #e0e4ec",
            }}
        >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>販売統計</Typography>

      <Card sx={{ mb: 4, bgcolor: '#ebf0ff', maxWidth: 300 }}>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>今日の注文数</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            {stats.todaySales} <span style={{ fontSize: '1rem' }}>件</span>
          </Typography>
        </CardContent>
      </Card>

       <Paper sx={{ p: 3, height: 500, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>最近7日間の販売推移</Typography>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={stats.totalTrend} margin={{ left: -20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            
            {/* 左青の注文件数 */}
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#3f51b5" 
              allowDecimals={false} 
            /> 
            
            {/* 右の緑の売上高部分 */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#4caf50" 
              tickFormatter={(value) => `¥${value.toLocaleString()}`}
            /> 
            
            <Tooltip 
              formatter={(value, name) => [
                name === 'daily_revenue' ? `¥${Number(value).toLocaleString()}` : `${value}件`, 
                name === 'daily_revenue' ? '確定売上' : '確定注文'
              ]}
            />

            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="daily_orders" 
              stroke="#3f51b5" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }}
            />

            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="daily_revenue" 
              stroke="#4caf50" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
       </Paper>
      </Paper>
    </Box>
  );
}

export default AdminSalesStats;