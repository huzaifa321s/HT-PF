"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import BDODetails from "@/components/pages/BDODetails";

export default function AdminBDODetailsPage({ params }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <BDODetails params={params} />
    </ProtectedRoute>
  );
}
