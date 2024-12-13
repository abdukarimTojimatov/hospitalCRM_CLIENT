// src/pages/NotFound.tsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        404 - Page Not Found
      </h1>
      <Link to="/" className="text-blue-500 hover:underline">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
