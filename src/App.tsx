import React, { useEffect } from "react";
import NavBar from "./components/NavBar";
import AppRoutes from "./routes/AppRoutes";
import { useUIStore } from "./store/useUIStore";
import { useAuthStore } from "./store/useAuthStore";

const App: React.FC = () => {
  const { darkMode } = useUIStore();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  console.log("initial::::", initializeAuth);
  // Initialize authentication state when the app loads
  useEffect(() => {
    initializeAuth(); // Load token and set authentication state
  }, [initializeAuth]);

  // Change theme based on darkMode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
      <NavBar />
      <AppRoutes />
    </div>
  );
};

export default App;
