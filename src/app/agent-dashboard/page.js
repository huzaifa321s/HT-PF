"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import AgentDashboard from "@/components/pages/AgentDashboard";

export default function AgentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <AgentDashboard />
    </ProtectedRoute>
  );
}
