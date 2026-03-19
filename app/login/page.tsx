"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, School } from "@mui/icons-material";
import { loginSchema, LoginFormData } from "@/lib/validations/auth.schema";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(data);
      const token = res.data.access_token;
      const payload = JSON.parse(atob(token.split(".")[1]));
      setAuth(token, payload);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Email yoki parol noto'g'ri"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#F8FAFC",
      }}
    >
      {/* Header / Branding */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)",
          color: "white",
          pt: 6,
          pb: 5,
          px: 3,
          textAlign: "center",
          borderRadius: { xs: "0 0 24px 24px", md: 0 },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: "rgba(79, 70, 229, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <School sx={{ fontSize: 30, color: "white" }} />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          Smart Attendance
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
          Davomatni oson boshqaring
        </Typography>
      </Box>

      {/* Form */}
      <Box
        sx={{
          flex: 1,
          px: 2.5,
          pt: 4,
          pb: 4,
          maxWidth: 480,
          width: "100%",
          mx: "auto",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Tizimga kirish
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Email va parolingizni kiriting
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            label="Email"
            placeholder="example@school.uz"
            size="small"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Parol"
            placeholder="Parolingizni kiriting"
            type={showPassword ? "text" : "password"}
            size="small"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <FormControlLabel
              control={<Checkbox size="small" />}
              label={
                <Typography variant="body2" color="text.secondary">
                  Eslab qolish
                </Typography>
              }
            />
            <MuiLink
              href="#"
              sx={{
                fontSize: "0.8rem",
                color: "#4F46E5",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Parolni unutdingizmi?
            </MuiLink>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.4,
              fontSize: "0.95rem",
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Kirish"
            )}
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
          >
            Hisobingiz yo&apos;qmi?{" "}
            <MuiLink
              href="/"
              sx={{
                color: "#4F46E5",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Ro&apos;yxatdan o&apos;tish
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
