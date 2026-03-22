"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import { Close, Logout, Edit } from "@mui/icons-material";
import { useAuthStore } from "@/store/auth.store";
import { teachersApi } from "@/lib/api/teachers.api";
import { useRouter } from "next/navigation";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  TEACHER: "O'qituvchi",
  SUPER_ADMIN: "Super Admin",
};

export default function ProfileDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);
    setError("");
    try {
      const res = await teachersApi.update(user._id, { fullName, phone });
      const updated = res.data.data;
      updateUser({ fullName: updated.fullName, phone: updated.phone });
      setEditing(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Profil
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: "#4F46E5",
              fontSize: "1.5rem",
              fontWeight: 700,
              mb: 1.5,
            }}
          >
            {user.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Avatar>
          {!editing && (
            <>
              <Typography variant="subtitle1" fontWeight={700}>
                {user.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Chip
                label={roleLabels[user.role] || user.role}
                size="small"
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  bgcolor: "#EEF2FF",
                  color: "#4F46E5",
                }}
              />
            </>
          )}
        </Box>

        {editing ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="To'liq ism"
              size="small"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <TextField
              label="Telefon"
              size="small"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <TextField
              label="Email"
              size="small"
              fullWidth
              value={user.email}
              disabled
            />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Telefon</Typography>
              <Typography variant="body2" fontWeight={500}>{user.phone}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Rol</Typography>
              <Typography variant="body2" fontWeight={500}>{roleLabels[user.role] || user.role}</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Button
          startIcon={<Logout />}
          color="error"
          size="small"
          onClick={handleLogout}
        >
          Chiqish
        </Button>
        {editing ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" color="inherit" onClick={() => setEditing(false)}>
              Bekor qilish
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={saving}
              onClick={handleSave}
              sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </Box>
        ) : (
          <Button
            startIcon={<Edit />}
            size="small"
            onClick={handleEdit}
            sx={{ color: "#4F46E5" }}
          >
            Tahrirlash
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
