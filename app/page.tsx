"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { School, ArrowForward } from "@mui/icons-material";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)",
        color: "white",
        px: 3,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.06)",
          top: -80,
          right: -80,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          bottom: -40,
          left: -40,
        }}
      />

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            bgcolor: "rgba(79, 70, 229, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <School sx={{ fontSize: 40, color: "white" }} />
        </Box>

        <Typography variant="h4" fontWeight={700} mb={1.5}>
          Smart Attendance
        </Typography>

        <Typography
          variant="body1"
          sx={{ opacity: 0.7, maxWidth: 300, mx: "auto", mb: 5, lineHeight: 1.7 }}
        >
          Maktab davomatini oson boshqaring
        </Typography>

        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          onClick={() => router.push("/login")}
          sx={{
            px: 5,
            py: 1.5,
            fontSize: "1rem",
            bgcolor: "#4F46E5",
            borderRadius: 2,
            "&:hover": { bgcolor: "#4338CA" },
          }}
        >
          Kirish
        </Button>
      </Box>
    </Box>
  );
}
