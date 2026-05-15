"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import BDMRegisterPage from "@/components/pages/BDMRegisterPage";

export default function AdminBDMsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <BDMRegisterPage />
    </ProtectedRoute>
  );
}
