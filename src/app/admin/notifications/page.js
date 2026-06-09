"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import NotificationsPage from "@/components/pages/NotificationsPage";

export default function AdminNotificationsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <NotificationsPage />
    </ProtectedRoute>
  );
}
