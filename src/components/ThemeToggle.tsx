// src/components/ThemeToggle.tsx
import React, { useEffect } from "react";
import { useUIStore } from "../store/useUIStore";

const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useUIStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded focus:outline-none bg-gray-200 dark:bg-gray-700"
    >
      {darkMode ? "🌞 Light Mode" : "🌜 Dark Mode"}
    </button>
  );
};

export default ThemeToggle;
