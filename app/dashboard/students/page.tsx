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
import { Search, Add, Delete, Close, Edit } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useIsAdmin } from "@/hooks/useRole";
import { Student, Class } from "@/types";

const createSchema = z.object({
  firstName: z.string().min(2, "Ism kiritilishi shart"),
  lastName: z.string().min(2, "Familiya kiritilishi shart"),
  classId: z.string().min(1, "Sinf tanlanishi shart"),
});

const editSchema = z.object({
  firstName: z.string().min(2, "Ism kiritilishi shart"),
  lastName: z.string().min(2, "Familiya kiritilishi shart"),
  classId: z.string().min(1, "Sinf tanlanishi shart"),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");

  const isAdmin = useIsAdmin();
  const { data: students, isLoading } = useStudents(filterClass || undefined);
  const { data: classes } = useClasses();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const filtered = students?.filter((s: Student) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const getClassName = (classId: string | Class) => {
    if (typeof classId === "object") return `${classId.grade}-${classId.section}`;
    const cls = classes?.find((c: Class) => c._id === classId);
    return cls ? `${cls.grade}-${cls.section}` : "";
  };

  const getClassIdStr = (classId: string | Class) => {
    return typeof classId === "object" ? classId._id : classId;
  };

  const handleCreate = async (data: CreateForm) => {
    setError("");
    try {
      await createStudent.mutateAsync(data);
      setCreateOpen(false);
      createForm.reset();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    editForm.reset({
      firstName: student.firstName,
      lastName: student.lastName,
      classId: getClassIdStr(student.classId),
    });
    setError("");
    setEditOpen(true);
  };

  const handleEdit = async (data: EditForm) => {
    if (!editingStudent) return;
    setError("");
    try {
      await updateStudent.mutateAsync({ id: editingStudent._id, data });
      setEditOpen(false);
      setEditingStudent(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("O'quvchini o'chirishni xohlaysizmi?")) {
      try {
        await deleteStudent.mutateAsync(id);
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
            O&apos;quvchilar
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
          placeholder="O'quvchi qidirish..."
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
          sx={{ mb: 1.5 }}
        />

        {/* Class filter */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label="Barchasi"
            size="small"
            onClick={() => setFilterClass("")}
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              bgcolor: !filterClass ? "#4F46E5" : "#F1F5F9",
              color: !filterClass ? "white" : "#64748B",
            }}
          />
          {classes?.map((cls: Class) => (
            <Chip
              key={cls._id}
              label={`${cls.grade}-${cls.section}`}
              size="small"
              onClick={() => setFilterClass(cls._id)}
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                bgcolor: filterClass === cls._id ? "#4F46E5" : "#F1F5F9",
                color: filterClass === cls._id ? "white" : "#64748B",
              }}
            />
          ))}
        </Box>

        {isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        )}

        {!isLoading && filtered?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              O&apos;quvchilar topilmadi
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered?.map((student: Student) => (
            <Card
              key={student._id}
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
                  sx={{ width: 44, height: 44, bgcolor: "#10B981", fontSize: "0.9rem", fontWeight: 600 }}
                >
                  {student.firstName[0]}{student.lastName[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {student.firstName} {student.lastName}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
                    <Chip
                      label={getClassName(student.classId)}
                      size="small"
                      sx={{ height: 20, fontSize: "0.6rem", fontWeight: 600, bgcolor: "#EEF2FF", color: "#4F46E5" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {student.connectCode}
                    </Typography>
                  </Box>
                </Box>
                {isAdmin && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => openEdit(student)}>
                      <Edit sx={{ fontSize: 18, color: "#64748B" }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(student._id)}>
                      <Delete sx={{ fontSize: 18, color: "#EF4444" }} />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Create Student Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>Yangi o&apos;quvchi</Typography>
          <IconButton size="small" onClick={() => setCreateOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={createForm.handleSubmit(handleCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Ism" size="small" fullWidth {...createForm.register("firstName")} error={!!createForm.formState.errors.firstName} helperText={createForm.formState.errors.firstName?.message} />
            <TextField label="Familiya" size="small" fullWidth {...createForm.register("lastName")} error={!!createForm.formState.errors.lastName} helperText={createForm.formState.errors.lastName?.message} />
            <TextField label="Sinf" size="small" fullWidth select defaultValue="" {...createForm.register("classId")} error={!!createForm.formState.errors.classId} helperText={createForm.formState.errors.classId?.message}>
              {classes?.map((cls: Class) => (
                <MenuItem key={cls._id} value={cls._id}>{cls.name} ({cls.grade}-{cls.section})</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} color="inherit">Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={createStudent.isPending} sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}>
              {createStudent.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>O&apos;quvchini tahrirlash</Typography>
          <IconButton size="small" onClick={() => setEditOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={editForm.handleSubmit(handleEdit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Ism" size="small" fullWidth {...editForm.register("firstName")} error={!!editForm.formState.errors.firstName} helperText={editForm.formState.errors.firstName?.message} />
            <TextField label="Familiya" size="small" fullWidth {...editForm.register("lastName")} error={!!editForm.formState.errors.lastName} helperText={editForm.formState.errors.lastName?.message} />
            <TextField label="Sinf" size="small" fullWidth select defaultValue={editingStudent ? getClassIdStr(editingStudent.classId) : ""} {...editForm.register("classId")} error={!!editForm.formState.errors.classId} helperText={editForm.formState.errors.classId?.message}>
              {classes?.map((cls: Class) => (
                <MenuItem key={cls._id} value={cls._id}>{cls.name} ({cls.grade}-{cls.section})</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditOpen(false)} color="inherit">Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={updateStudent.isPending} sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}>
              {updateStudent.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
