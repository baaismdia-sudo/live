import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { authRoutes } from "./routes/authRoutes";
import { marketingRoutes } from "./routes/marketingRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { organizerRoutes } from "./routes/organizerRoutes";
import { liveRoutes } from "./routes/liveRoutes";
import { publicSiteRoutes } from "./routes/publicSiteRoutes";

function AppRoutes() {
  const element = useRoutes([...marketingRoutes, ...authRoutes, ...adminRoutes, ...organizerRoutes, ...liveRoutes, ...publicSiteRoutes]);
  return element;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
