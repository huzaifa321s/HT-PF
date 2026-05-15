"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import dynamic from "next/dynamic";

const ProposalDetails = dynamic(() => import("@/components/pages/ProposalDetails"), { ssr: false });

export default function AdminProposalDetailsPage({ params }) {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <ProposalDetails params={params} />
    </ProtectedRoute>
  );
}
