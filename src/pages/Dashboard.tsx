// src/pages/Dashboard.tsx
import React from "react";
import { useAuthStore } from "../store/useAuthStore";

const Dashboard: React.FC = () => {
  const { role } = useAuthStore();

  return (
    <div className="p-6">
      <h2 className="text-3xl mb-4 text-gray-800 dark:text-white">Dashboard</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Welcome, {role}! Use the navigation bar to access different sections.
      </p>
    </div>
  );
};

export default Dashboard;
