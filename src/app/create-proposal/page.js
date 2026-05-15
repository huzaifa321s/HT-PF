"use client";
import ProtectedRoute from "@/lib/ProtectedRoute";
import dynamic from "next/dynamic";

// Dynamically import App (PDF editor) — disables SSR because it uses browser APIs
const App = dynamic(() => import("@/components/App"), { ssr: false });

export default function CreateProposalPage() {
  return (
    <ProtectedRoute allowedRoles={["agent", "admin"]}>
      <App />
    </ProtectedRoute>
  );
}
