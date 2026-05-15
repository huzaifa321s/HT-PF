"use client";
import Login from "@/components/pages/Login";

// Admin login uses the same Login component; the pathname check inside handles the heading label
export default function AdminLoginPage() {
  return <Login />;
}
