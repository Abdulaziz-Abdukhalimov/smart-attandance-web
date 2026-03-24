"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import BottomNav from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Wait for hydration, then check auth
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.replace("/login");
    }
  }, [router]);

  // Show loading while hydrating
  if (!token && typeof window !== "undefined" && localStorage.getItem("token")) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F8FAFC" }}>
        <CircularProgress sx={{ color: "#4F46E5" }} />
      </Box>
    );
  }

  if (!token) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", pb: "80px" }}>
      {children}
      <BottomNav />
    </Box>
  );
}
