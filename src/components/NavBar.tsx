// src/components/NavBar.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import ThemeToggle from "./ThemeToggle";

const NavBar: React.FC = () => {
  const { isAuthenticated, role, logout } = useAuthStore();
  console.log("isAuthenticated", isAuthenticated);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Hospital CRM
        </h1>
        {isAuthenticated && (
          <>
            <Link
              to="/"
              className="text-gray-800 dark:text-white hover:underline"
            >
              Dashboard
            </Link>
            {role === "Admin" && (
              <Link
                to="/doctors"
                className="text-gray-800 dark:text-white hover:underline"
              >
                Doctors
              </Link>
            )}
            {role === "Reception" && (
              <>
                <Link
                  to="/patients"
                  className="text-gray-800 dark:text-white hover:underline"
                >
                  Patients
                </Link>
                <Link
                  to="/appointments"
                  className="text-gray-800 dark:text-white hover:underline"
                >
                  Appointments
                </Link>
              </>
            )}
            {role === "CEO" && (
              <Link
                to="/reports"
                className="text-gray-800 dark:text-white hover:underline"
              >
                Reports
              </Link>
            )}
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
