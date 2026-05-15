"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import dynamic from "next/dynamic";

const AdminProposalsPage = dynamic(() => import("@/components/pages/AdminProposalPage"), { ssr: false });

export default function AdminProposals() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminProposalsPage />
    </ProtectedRoute>
  );
}
