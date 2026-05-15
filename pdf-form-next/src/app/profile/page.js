"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import Profile from "@/components/pages/Profile";

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <Profile />
    </ProtectedRoute>
  );
}
