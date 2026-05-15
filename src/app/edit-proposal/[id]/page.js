"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import dynamic from "next/dynamic";

const EditProposal = dynamic(() => import("@/components/pages/EditProposal"), { ssr: false });

export default function EditProposalPage({ params }) {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <EditProposal params={params} />
    </ProtectedRoute>
  );
}
