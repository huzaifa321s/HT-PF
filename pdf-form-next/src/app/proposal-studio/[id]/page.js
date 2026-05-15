"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import dynamic from "next/dynamic";

const ProposalStudio = dynamic(() => import("@/components/pages/ProposalStudio"), { ssr: false });

export default function ProposalStudioPage() {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <ProposalStudio />
    </ProtectedRoute>
  );
}
