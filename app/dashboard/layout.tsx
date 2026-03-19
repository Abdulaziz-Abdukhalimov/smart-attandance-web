"use client";

import { Box } from "@mui/material";
import BottomNav from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", pb: "80px" }}>
      {children}
      <BottomNav />
    </Box>
  );
}
