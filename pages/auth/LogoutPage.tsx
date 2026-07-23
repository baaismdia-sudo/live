import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "../../components/ui/LoadingSpinner";
import { signOut } from "../../services/supabase/auth";

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    signOut().finally(() => navigate("/login", { replace: true }));
  }, [navigate]);

  return <PageLoader label="Logging you out..." />;
}
