// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, token } = useAuthStore();

  console.log("token", token);
  if (!isAuthenticated || !token) {
    // Redirect to login and potentially clear any stale auth state
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
