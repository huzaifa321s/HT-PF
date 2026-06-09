"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import dynamic from "next/dynamic";

const ProposalPage = dynamic(() => import("@/components/pages/ProposalPage"), { ssr: false });

export default function AdminProposals() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <ProposalPage />
    </ProtectedRoute>
  );
}
