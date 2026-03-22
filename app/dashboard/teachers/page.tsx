"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Skeleton,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Add,
  Phone,
  Edit,
  Delete,
  Close,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from "@/hooks/useTeachers";
import { useIsAdmin } from "@/hooks/useRole";
import { Teacher } from "@/types";

const createSchema = z.object({
  fullName: z.string().min(2, "Ism kiritilishi shart"),
  email: z.string().email("Email noto'g'ri"),
  phone: z.string().min(9, "Telefon raqam kiritilishi shart"),
  password: z.string().min(6, "Kamida 6 belgi"),
  role: z.enum(["ADMIN", "TEACHER"], { message: "Rol tanlanishi shart" }),
});

const editSchema = z.object({
  fullName: z.string().min(2, "Ism kiritilishi shart"),
  phone: z.string().min(9, "Telefon raqam kiritilishi shart"),
  role: z.enum(["ADMIN", "TEACHER"], { message: "Rol tanlanishi shart" }),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  TEACHER: "O'qituvchi",
  SUPER_ADMIN: "Super Admin",
};

const roleColors: Record<string, string> = {
  ADMIN: "#4F46E5",
  TEACHER: "#10B981",
  SUPER_ADMIN: "#F59E0B",
};

export default function TeachersPage() {
  const isAdmin = useIsAdmin();
  const { data: teachers, isLoading } = useTeachers();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState("");

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const filtered = teachers?.filter((t: Teacher) =>
    t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: CreateForm) => {
    setError("");
    try {
      await createTeacher.mutateAsync(data);
      setCreateOpen(false);
      createForm.reset();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    editForm.reset({
      fullName: teacher.fullName,
      phone: teacher.phone,
      role: teacher.role as "ADMIN" | "TEACHER",
    });
    setError("");
    setEditOpen(true);
  };

  const handleEdit = async (data: EditForm) => {
    if (!editingTeacher) return;
    setError("");
    try {
      await updateTeacher.mutateAsync({ id: editingTeacher._id, data });
      setEditOpen(false);
      setEditingTeacher(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("O'qituvchini o'chirishni xohlaysizmi?")) {
      try {
        await deleteTeacher.mutateAsync(id);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        alert(e.response?.data?.message || "O'chirishda xatolik yuz berdi");
      }
    }
  };

  return (
    <Box>
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            O&apos;qituvchilar
          </Typography>
          {isAdmin && (
            <IconButton
              onClick={() => { setError(""); createForm.reset(); setCreateOpen(true); }}
              sx={{ bgcolor: "#4F46E5", color: "white", "&:hover": { bgcolor: "#4338CA" } }}
              size="small"
            >
              <Add />
            </IconButton>
          )}
        </Box>

        <TextField
          placeholder="Ism yoki email bo'yicha qidirish..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#94A3B8", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        )}

        {!isLoading && filtered?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              O&apos;qituvchilar topilmadi
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered?.map((teacher: Teacher) => (
            <Card
              key={teacher._id}
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                border: "1px solid #F1F5F9",
              }}
            >
              <CardContent
                sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 2 }}
              >
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: roleColors[teacher.role] || "#4F46E5",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  {teacher.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {teacher.fullName}
                    </Typography>
                    <Chip
                      label={roleLabels[teacher.role] || teacher.role}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        bgcolor: `${roleColors[teacher.role]}15`,
                        color: roleColors[teacher.role],
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {teacher.email}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                    <Phone sx={{ fontSize: 12, color: "#94A3B8" }} />
                    <Typography variant="caption" color="text.secondary">
                      {teacher.phone}
                    </Typography>
                  </Box>
                </Box>
                {isAdmin && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => openEdit(teacher)}>
                      <Edit sx={{ fontSize: 18, color: "#64748B" }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(teacher._id)}>
                      <Delete sx={{ fontSize: 18, color: "#EF4444" }} />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Create Teacher Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>Yangi o&apos;qituvchi</Typography>
          <IconButton size="small" onClick={() => setCreateOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={createForm.handleSubmit(handleCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="To'liq ism" size="small" fullWidth {...createForm.register("fullName")} error={!!createForm.formState.errors.fullName} helperText={createForm.formState.errors.fullName?.message} />
            <TextField label="Email" size="small" fullWidth {...createForm.register("email")} error={!!createForm.formState.errors.email} helperText={createForm.formState.errors.email?.message} />
            <TextField label="Telefon" size="small" fullWidth {...createForm.register("phone")} error={!!createForm.formState.errors.phone} helperText={createForm.formState.errors.phone?.message} />
            <TextField label="Parol" type="password" size="small" fullWidth {...createForm.register("password")} error={!!createForm.formState.errors.password} helperText={createForm.formState.errors.password?.message} />
            <TextField label="Rol" size="small" fullWidth select defaultValue="" {...createForm.register("role")} error={!!createForm.formState.errors.role} helperText={createForm.formState.errors.role?.message}>
              <MenuItem value="TEACHER">O&apos;qituvchi</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} color="inherit">Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={createTeacher.isPending} sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}>
              {createTeacher.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Teacher Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>O&apos;qituvchini tahrirlash</Typography>
          <IconButton size="small" onClick={() => setEditOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(handleEdit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="To'liq ism" size="small" fullWidth {...editForm.register("fullName")} error={!!editForm.formState.errors.fullName} helperText={editForm.formState.errors.fullName?.message} />
            <TextField label="Email" size="small" fullWidth value={editingTeacher?.email || ""} disabled />
            <TextField label="Telefon" size="small" fullWidth {...editForm.register("phone")} error={!!editForm.formState.errors.phone} helperText={editForm.formState.errors.phone?.message} />
            <TextField label="Rol" size="small" fullWidth select defaultValue={editingTeacher?.role || ""} {...editForm.register("role")} error={!!editForm.formState.errors.role} helperText={editForm.formState.errors.role?.message}>
              <MenuItem value="TEACHER">O&apos;qituvchi</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditOpen(false)} color="inherit">Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={updateTeacher.isPending} sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}>
              {updateTeacher.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
