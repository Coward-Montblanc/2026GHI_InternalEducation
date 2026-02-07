import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";

function NoticePage() {
	const [loading, setLoading] = useState(true);
	const [notices, setNotices] = useState([]);

	useEffect(() => { //로딩시간
		setLoading(true);
		setTimeout(() => {
			setNotices([]); 
			setLoading(false);
		}, 1000);
	}, []);

	return (
		<>
			<div style={{ minHeight: '60vh', padding: '40px 0', textAlign: 'center' }}>
				<h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: 24 }}>お知らせ</h2>
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
						<CircularProgress />
					</Box>
				) : (

					<p>サービス点検中です。しばらくお待ちください。</p>

				)}
			</div>
			<Footer />
		</>
	);
}

export default NoticePage;