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
import { Search, Add, Delete, Close, Edit, MenuBook } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubjects, useCreateSubject, useDeleteSubject } from "@/hooks/useSubjects";
import { useIsAdmin } from "@/hooks/useRole";
import { Subject } from "@/types";

const subjectSchema = z.object({
  name: z.string().min(1, "Fan nomi kiritilishi shart"),
});
type SubjectForm = z.infer<typeof subjectSchema>;

const subjectColors = [
  "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

export default function SubjectsPage() {
  const isAdmin = useIsAdmin();
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const deleteSubject = useDeleteSubject();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
  });

  const filtered = subjects?.filter((s: Subject) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async (data: SubjectForm) => {
    setError("");
    try {
      await createSubject.mutateAsync(data);
      setOpen(false);
      reset();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Fanni o'chirishni xohlaysizmi?")) {
      await deleteSubject.mutateAsync(id);
    }
  };

  return (
    <Box>
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Fanlar
          </Typography>
          {isAdmin && (
            <IconButton
              onClick={() => setOpen(true)}
              sx={{ bgcolor: "#4F46E5", color: "white", "&:hover": { bgcolor: "#4338CA" } }}
              size="small"
            >
              <Add />
            </IconButton>
          )}
        </Box>

        <TextField
          placeholder="Fan qidirish..."
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
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        )}

        {!isLoading && filtered?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Fanlar topilmadi
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered?.map((subject: Subject, idx: number) => {
            const color = subjectColors[idx % subjectColors.length];
            return (
              <Card
                key={subject._id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  border: "1px solid #F1F5F9",
                }}
              >
                <CardContent
                  sx={{
                    p: 2,
                    "&:last-child": { pb: 2 },
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: `${color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color,
                    }}
                  >
                    <MenuBook sx={{ fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {subject.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(subject.createdAt).toLocaleDateString("uz-UZ")}
                    </Typography>
                  </Box>
                  {isAdmin && (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton size="small">
                        <Edit sx={{ fontSize: 18, color: "#64748B" }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(subject._id)}>
                        <Delete sx={{ fontSize: 18, color: "#EF4444" }} />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Add Subject Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Yangi fan
          </Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 1 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              label="Fan nomi"
              placeholder="Masalan: Matematika"
              size="small"
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)} color="inherit">
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createSubject.isPending}
              sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}
            >
              {createSubject.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
