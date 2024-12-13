// src/routes/AppRoutes.tsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";

import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import AdminDoctorPage from "../pages/AdminDoctorPage";
import ReceptionPatientsPage from "../pages/ReceptionPatientsPage";
import ReceptionAppointmentsPage from "../pages/ReceptionAppointmentsPage";
import CEOReportsPage from "../pages/CEOReportsPage";
import NotFound from "../pages/NotFound";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />

        {/* Admin Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/doctors" element={<AdminDoctorPage />} />
        </Route>

        {/* Reception Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["Reception"]} />}>
          <Route path="/patients" element={<ReceptionPatientsPage />} />
          <Route path="/appointments" element={<ReceptionAppointmentsPage />} />
        </Route>

        {/* CEO Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["CEO"]} />}>
          <Route path="/reports" element={<CEOReportsPage />} />
        </Route>
      </Route>

      {/* Catch All - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
