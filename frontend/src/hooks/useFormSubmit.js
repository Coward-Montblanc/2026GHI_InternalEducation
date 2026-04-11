import { useNavigate } from "react-router-dom";

export const useFormSubmit = (successUrl) => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(successUrl, { replace: true });
  };

  return { handleSuccess };
};