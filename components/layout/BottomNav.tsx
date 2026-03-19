"use client";

import { usePathname, useRouter } from "next/navigation";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Home,
  People,
  Class,
  School,
  Settings,
} from "@mui/icons-material";

const navItems = [
  { label: "Bosh sahifa", icon: <Home />, path: "/dashboard" },
  { label: "O'qituvchilar", icon: <People />, path: "/dashboard/teachers" },
  { label: "Sinflar", icon: <Class />, path: "/dashboard/classes" },
  { label: "O'quvchilar", icon: <School />, path: "/dashboard/students" },
  { label: "Sozlamalar", icon: <Settings />, path: "/dashboard/settings" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = navItems.findIndex((item) => pathname === item.path);

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: "1px solid #E2E8F0",
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentIndex === -1 ? 0 : currentIndex}
        onChange={(_, newValue) => {
          router.push(navItems[newValue].path);
        }}
        sx={{
          height: 64,
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            py: 1,
            color: "#94A3B8",
            "&.Mui-selected": {
              color: "#4F46E5",
            },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: "0.65rem",
            mt: 0.3,
            "&.Mui-selected": {
              fontSize: "0.65rem",
              fontWeight: 600,
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
