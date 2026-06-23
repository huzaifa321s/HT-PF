"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import dynamic from "next/dynamic";

const TrashPage = dynamic(() => import("@/components/pages/TrashPage"), { ssr: false });

export default function TrashRoute() {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <TrashPage />
    </ProtectedRoute>
  );
}
