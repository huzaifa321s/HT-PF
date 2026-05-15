"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import Home from "@/components/pages/Home";

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Home />
    </ProtectedRoute>
  );
}
