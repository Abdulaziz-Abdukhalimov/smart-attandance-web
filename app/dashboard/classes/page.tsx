"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
} from "@mui/material";
import { Search, Add, Delete, Close, Edit, People } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useIsAdmin } from "@/hooks/useRole";
import { Class, Student } from "@/types";

const createSchema = z.object({
  name: z.string().min(1, "Sinf nomi kiritilishi shart"),
  grade: z.string().min(1, "Sinf raqami kiritilishi shart"),
  section: z.string().min(1, "Bo'lim kiritilishi shart"),
});

const editSchema = z.object({
  name: z.string().min(1, "Sinf nomi kiritilishi shart"),
  grade: z.string().min(1, "Sinf raqami kiritilishi shart"),
  section: z.string().min(1, "Bo'lim kiritilishi shart"),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

const gradeColors = [
  "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

export default function ClassesPage() {
  const isAdmin = useIsAdmin();
  const { data: classes, isLoading } = useClasses();
  const { data: allStudents } = useStudents();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [error, setError] = useState("");

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const filtered = classes?.filter((c: Class) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    `${c.grade}-${c.section}`.toLowerCase().includes(search.toLowerCase())
  );

  const getStudentCount = (classId: string) => {
    if (!allStudents) return 0;
    return allStudents.filter((s: Student) => {
      const sid = typeof s.classId === "object" ? s.classId._id : s.classId;
      return sid === classId;
    }).length;
  };

  const handleCreate = async (data: CreateForm) => {
    setError("");
    try {
      await createClass.mutateAsync(data);
      setCreateOpen(false);
      createForm.reset();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const openEdit = (cls: Class) => {
    setEditingClass(cls);
    editForm.reset({ name: cls.name, grade: cls.grade, section: cls.section });
    setError("");
    setEditOpen(true);
  };

  const handleEdit = async (data: EditForm) => {
    if (!editingClass) return;
    setError("");
    try {
      await updateClass.mutateAsync({ id: editingClass._id, data });
      setEditOpen(false);
      setEditingClass(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sinfni o'chirishni xohlaysizmi?")) {
      try {
        await deleteClass.mutateAsync(id);
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
          <Typography variant="h6" fontWeight={700}>Sinflar</Typography>
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
          placeholder="Sinf qidirish..."
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
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        )}

        {!isLoading && filtered?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="text.secondary">Sinflar topilmadi</Typography>
          </Box>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
          {filtered?.map((cls: Class, idx: number) => {
            const color = gradeColors[idx % gradeColors.length];
            const count = getStudentCount(cls._id);
            return (
              <Card
                key={cls._id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  border: "1px solid #F1F5F9",
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                      color,
                    }}
                  >
                    <People sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {cls.grade}-{cls.section}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {cls.name}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color={color} display="block" mt={0.5}>
                    {count} ta o&apos;quvchi
                  </Typography>
                  {isAdmin && (
                    <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                      <IconButton size="small" onClick={() => openEdit(cls)}>
                        <Edit sx={{ fontSize: 16, color: "#64748B" }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(cls._id)}>
                        <Delete sx={{ fontSize: 16, color: "#EF4444" }} />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Create Class Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>Yangi sinf</Typography>
          <IconButton size="small" onClick={() => setCreateOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={createForm.handleSubmit(handleCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Sinf nomi" placeholder="Masalan: 9-A sinf" size="small" fullWidth {...createForm.register("name")} error={!!createForm.formState.errors.name} helperText={createForm.formState.errors.name?.message} />
            <TextField label="Sinf raqami (grade)" placeholder="Masalan: 9" size="small" fullWidth {...createForm.register("grade")} error={!!createForm.formState.errors.grade} helperText={createForm.formState.errors.grade?.message} />
            <TextField label="Bo'lim (section)" placeholder="Masalan: A" size="small" fullWidth {...createForm.register("section")} error={!!createForm.formState.errors.section} helperText={createForm.formState.errors.section?.message} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} color="inherit">Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={createClass.isPending} sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}>
              {createClass.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>Sinfni tahrirlash</Typography>
          <IconButton size="small" onClick={() => setEditOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(handleEdit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Sinf nomi" size="small" fullWidth {...editForm.register("name")} error={!!editForm.formState.errors.name} helperText={editForm.formState.errors.name?.message} />
            <TextField label="Sinf raqami (grade)" size="small" fullWidth {...editForm.register("grade")} error={!!editForm.formState.errors.grade} helperText={editForm.formState.errors.grade?.message} />
            <TextField label="Bo'lim (section)" size="small" fullWidth {...editForm.register("section")} error={!!editForm.formState.errors.section} helperText={editForm.formState.errors.section?.message} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditOpen(false)} color="inherit">Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={updateClass.isPending} sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}>
              {updateClass.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
