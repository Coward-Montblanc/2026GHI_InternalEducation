import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";

function EventPage() {
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState([]); //아직

	useEffect(() => { //로딩 처리
		setLoading(true);
		setTimeout(() => {
			setEvents([]); 
			setLoading(false);
		}, 1000);
	}, []);

	return (
		<>
			<div style={{ minHeight: '60vh', padding: '40px 0', textAlign: 'center' }}>
				<h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: 24 }}>イベント</h2>
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
						<CircularProgress />
					</Box>
				) : (
					<p>現在進行中のイベントはありません。</p>
				)}
			</div>
			<Footer />
		</>
	);
}

export default EventPage;