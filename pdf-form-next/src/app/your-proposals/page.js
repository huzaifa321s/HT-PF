"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import dynamic from "next/dynamic";

const ProposalPage = dynamic(() => import("@/components/pages/ProposalPage"), { ssr: false });

export default function YourProposalsPage() {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <ProposalPage />
    </ProtectedRoute>
  );
}
