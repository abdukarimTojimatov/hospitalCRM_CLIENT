// src/components/RoleProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface RoleProtectedRouteProps {
  allowedRoles: ("CEO" | "Admin" | "Reception")[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { role } = useAuthStore();
  return role && allowedRoles.includes(role) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default RoleProtectedRoute;
