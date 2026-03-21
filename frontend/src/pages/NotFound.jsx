import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingCircle from "../components/LoadingCircle";

function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    alert("無効なページです。（404 Not Found）");
    
    navigate("/", { replace: true }); 
  }, [navigate]);

  return <LoadingCircle />;
}

export default NotFound;