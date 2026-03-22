"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Skeleton,
  Alert,
} from "@mui/material";
import { Add, Delete, Close, AccessTime } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSchedules, useMyWeeklySchedule, useCreateSchedule, useDeleteSchedule } from "@/hooks/useSchedules";
import { useTeachers } from "@/hooks/useTeachers";
import { useClasses } from "@/hooks/useClasses";
import { useSubjects } from "@/hooks/useSubjects";
import { useIsAdmin } from "@/hooks/useRole";
import { Schedule, Teacher, Class, Subject } from "@/types";

const scheduleSchema = z.object({
  teacherId: z.string().min(1, "O'qituvchi tanlanishi shart"),
  classId: z.string().min(1, "Sinf tanlanishi shart"),
  subjectId: z.string().min(1, "Fan tanlanishi shart"),
  weekday: z.number().min(1).max(7, "Kun tanlanishi shart"),
  period: z.number().min(1).max(10, "Dars raqami kiritilishi shart"),
  startTime: z.string().min(1, "Boshlanish vaqti kiritilishi shart"),
  endTime: z.string().min(1, "Tugash vaqti kiritilishi shart"),
});
type ScheduleForm = z.infer<typeof scheduleSchema>;

const dayLabels: Record<number, string> = {
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
  7: "Yakshanba",
};

const dayColors: Record<number, string> = {
  1: "#4F46E5",
  2: "#10B981",
  3: "#F59E0B",
  4: "#8B5CF6",
  5: "#EC4899",
  6: "#06B6D4",
  7: "#EF4444",
};

export default function SchedulesPage() {
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [filterDay, setFilterDay] = useState<number | null>(null);

  // Admin sees all schedules, teacher sees only their own
  // Only fetch admin schedules if admin, teacher schedules if teacher
  const adminQuery = useSchedules(isAdmin);
  const teacherQuery = useMyWeeklySchedule(filterDay ?? undefined, !isAdmin);

  const adminSchedules = adminQuery.data;
  const loadingAdmin = adminQuery.isLoading && isAdmin;
  const teacherSchedules = teacherQuery.data;
  const loadingTeacher = teacherQuery.isLoading && !isAdmin;

  const schedules = isAdmin ? adminSchedules : teacherSchedules;
  const isLoading = isAdmin ? loadingAdmin : loadingTeacher;

  const { data: teachers } = useTeachers();
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  });

  const getTeacherName = (id: string | Teacher) => {
    if (typeof id === "object") return id.fullName;
    return teachers?.find((t) => t._id === id)?.fullName || "";
  };

  const getClassName = (id: string | Class) => {
    if (typeof id === "object") return `${id.grade}-${id.section}`;
    const cls = classes?.find((c) => c._id === id);
    return cls ? `${cls.grade}-${cls.section}` : "";
  };

  const getSubjectName = (id: string | Subject) => {
    if (typeof id === "object") return id.name;
    return subjects?.find((s) => s._id === id)?.name || "";
  };

  const filtered = schedules?.filter((s: Schedule) =>
    filterDay === null || s.weekday === filterDay
  )?.sort((a: Schedule, b: Schedule) => {
    if (a.weekday !== b.weekday) return a.weekday - b.weekday;
    return a.period - b.period;
  });

  const handleCreate = async (data: ScheduleForm) => {
    setError("");
    try {
      await createSchedule.mutateAsync(data);
      setOpen(false);
      reset();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Dars jadvalini o'chirishni xohlaysizmi?")) {
      try {
        await deleteSchedule.mutateAsync(id);
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
          <Typography variant="h6" fontWeight={700}>Dars jadvali</Typography>
          {isAdmin && (
            <IconButton
              onClick={() => { setError(""); reset(); setOpen(true); }}
              sx={{ bgcolor: "#4F46E5", color: "white", "&:hover": { bgcolor: "#4338CA" } }}
              size="small"
            >
              <Add />
            </IconButton>
          )}
        </Box>

        {/* Day filter */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label="Barchasi"
            size="small"
            onClick={() => setFilterDay(null)}
            sx={{
              fontWeight: 600, fontSize: "0.7rem",
              bgcolor: filterDay === null ? "#4F46E5" : "#F1F5F9",
              color: filterDay === null ? "white" : "#64748B",
            }}
          />
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <Chip
              key={d}
              label={dayLabels[d]}
              size="small"
              onClick={() => setFilterDay(d)}
              sx={{
                fontWeight: 600, fontSize: "0.7rem",
                bgcolor: filterDay === d ? dayColors[d] : "#F1F5F9",
                color: filterDay === d ? "white" : "#64748B",
              }}
            />
          ))}
        </Box>

        {isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        )}

        {!isLoading && filtered?.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="text.secondary">Dars jadvali topilmadi</Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered?.map((schedule: Schedule) => (
            <Card
              key={schedule._id}
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                border: "1px solid #F1F5F9",
                borderLeft: `4px solid ${dayColors[schedule.weekday] || "#4F46E5"}`,
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Chip
                        label={dayLabels[schedule.weekday]}
                        size="small"
                        sx={{
                          height: 22, fontSize: "0.65rem", fontWeight: 600,
                          bgcolor: `${dayColors[schedule.weekday]}15`,
                          color: dayColors[schedule.weekday],
                        }}
                      />
                      <Chip
                        label={`${schedule.period}-dars`}
                        size="small"
                        sx={{ height: 22, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#F1F5F9", color: "#64748B" }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {getSubjectName(schedule.subjectId)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getTeacherName(schedule.teacherId)} • {getClassName(schedule.classId)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <AccessTime sx={{ fontSize: 14, color: "#94A3B8" }} />
                      <Typography variant="caption" color="text.secondary">
                        {schedule.startTime} - {schedule.endTime}
                      </Typography>
                    </Box>
                  </Box>
                  {isAdmin && (
                    <IconButton size="small" onClick={() => handleDelete(schedule._id)}>
                      <Delete sx={{ fontSize: 18, color: "#EF4444" }} />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Create Schedule Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={700}>Yangi dars jadvali</Typography>
          <IconButton size="small" onClick={() => setOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handleCreate)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField label="O'qituvchi" size="small" fullWidth select defaultValue="" {...register("teacherId")} error={!!errors.teacherId} helperText={errors.teacherId?.message}>
              {teachers?.map((t: Teacher) => (
                <MenuItem key={t._id} value={t._id}>{t.fullName}</MenuItem>
              ))}
            </TextField>

            <TextField label="Sinf" size="small" fullWidth select defaultValue="" {...register("classId")} error={!!errors.classId} helperText={errors.classId?.message}>
              {classes?.map((c: Class) => (
                <MenuItem key={c._id} value={c._id}>{c.grade}-{c.section} ({c.name})</MenuItem>
              ))}
            </TextField>

            <TextField label="Fan" size="small" fullWidth select defaultValue="" {...register("subjectId")} error={!!errors.subjectId} helperText={errors.subjectId?.message}>
              {subjects?.map((s: Subject) => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </TextField>

            <Controller
              name="weekday"
              control={control}
              defaultValue={undefined as unknown as number}
              render={({ field }) => (
                <TextField
                  label="Kun"
                  size="small"
                  fullWidth
                  select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!errors.weekday}
                  helperText={errors.weekday?.message}
                >
                  {[1, 2, 3, 4, 5, 6].map((d) => (
                    <MenuItem key={d} value={d}>{dayLabels[d]}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="period"
              control={control}
              defaultValue={undefined as unknown as number}
              render={({ field }) => (
                <TextField
                  label="Dars raqami"
                  size="small"
                  fullWidth
                  select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!errors.period}
                  helperText={errors.period?.message}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                    <MenuItem key={p} value={p}>{p}-dars</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Boshlanish vaqti"
                placeholder="08:00"
                size="small"
                fullWidth
                {...register("startTime")}
                error={!!errors.startTime}
                helperText={errors.startTime?.message}
              />
              <TextField
                label="Tugash vaqti"
                placeholder="08:45"
                size="small"
                fullWidth
                {...register("endTime")}
                error={!!errors.endTime}
                helperText={errors.endTime?.message}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)} color="inherit">Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={createSchedule.isPending} sx={{ bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}>
              {createSchedule.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
