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
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  School,
  ArrowForward,
} from "@mui/icons-material";
import { signupSchema, SignupFormData } from "@/lib/validations/auth.schema";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.signup(data);
      const { token, user } = res.data.data;
      setAuth(token, {
        sub: user._id,
        role: user.role,
        schoolId: user.schoolId,
        email: user.email,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi"
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
          pt: 5,
          pb: 4,
          px: 3,
          textAlign: "center",
          borderRadius: "0 0 24px 24px",
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
          pt: 3,
          pb: 4,
          maxWidth: 480,
          width: "100%",
          mx: "auto",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Ro&apos;yxatdan o&apos;tish
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          Maktab ma&apos;lumotlarini kiriting
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing={1}
          >
            Maktab ma&apos;lumotlari
          </Typography>

          <TextField
            label="Maktab nomi"
            placeholder="Masalan: 12-IDUM"
            size="small"
            fullWidth
            {...register("schoolName")}
            error={!!errors.schoolName}
            helperText={errors.schoolName?.message}
          />

          <TextField
            label="Maktab manzili"
            placeholder="Viloyat, tuman, ko'cha..."
            size="small"
            fullWidth
            {...register("schoolAddress")}
            error={!!errors.schoolAddress}
            helperText={errors.schoolAddress?.message}
          />

          <TextField
            label="Maktab telefon raqami"
            placeholder="+998"
            size="small"
            fullWidth
            {...register("schoolPhone")}
            error={!!errors.schoolPhone}
            helperText={errors.schoolPhone?.message}
          />

          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing={1}
            mt={0.5}
          >
            Admin ma&apos;lumotlari
          </Typography>

          <TextField
            label="To'liq ismingiz"
            placeholder="Ism va familiyangiz"
            size="small"
            fullWidth
            {...register("fullName")}
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
          />

          <TextField
            label="Email manzil"
            placeholder="example@gmail.com"
            size="small"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Shaxsiy telefon"
            placeholder="+998"
            size="small"
            fullWidth
            {...register("phone")}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />

          <TextField
            label="Parol yarating"
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            endIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ArrowForward />
              )
            }
            sx={{
              mt: 1,
              py: 1.4,
              fontSize: "0.95rem",
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
            }}
          >
            Ro&apos;yxatdan o&apos;tish
          </Button>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Akkauntingiz bormi?{" "}
            <MuiLink
              href="/login"
              sx={{
                color: "#4F46E5",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Kirish
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
