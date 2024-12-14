// src/App.tsx
import React, { useEffect } from "react";
import NavBar from "./components/NavBar";
import AppRoutes from "./routes/AppRoutes";
import { useUIStore } from "./store/useUIStore";

const App: React.FC = () => {
  const { darkMode } = useUIStore();

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
