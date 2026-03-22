"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  AccessTime,
  Send,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesApi } from "@/lib/api/schedules.api";
import { studentsApi } from "@/lib/api/students.api";
import { attendanceApi } from "@/lib/api/attendance.api";
import { Student, AttendanceStatus, Schedule } from "@/types";

type StudentRecord = {
  studentId: string;
  status: AttendanceStatus;
};

function TakeAttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scheduleId = searchParams.get("scheduleId") || "";

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch schedule details
  const { data: schedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      const res = await schedulesApi.getById(scheduleId);
      return res.data.data;
    },
    enabled: !!scheduleId,
  });

  // Get classId from schedule
  const classId = schedule
    ? typeof schedule.classId === "object"
      ? (schedule.classId as { _id: string })._id
      : schedule.classId
    : "";

  // Fetch students of this class
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["students", classId],
    queryFn: async () => {
      const res = await studentsApi.getAll(classId);
      return res.data.data;
    },
    enabled: !!classId,
  });

  // Initialize all students as PRESENT by default
  useEffect(() => {
    if (students && records.length === 0) {
      setRecords(
        students.map((s: Student) => ({
          studentId: s._id,
          status: "PRESENT" as AttendanceStatus,
        }))
      );
    }
  }, [students, records.length]);

  // Open session mutation
  const openSession = useMutation({
    mutationFn: () => attendanceApi.openSession(scheduleId),
    onSuccess: (res) => {
      setSessionId(res.data.data._id);
      setError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || "Sessiyani ochishda xatolik";
      // If session already exists, try to get existing sessions
      if (msg.includes("already") || msg.includes("exists") || msg.includes("mavjud")) {
        fetchExistingSession();
      } else {
        setError(msg);
      }
    },
  });

  // Mark attendance mutation
  const markAttendance = useMutation({
    mutationFn: (data: { sessionId: string; records: StudentRecord[] }) =>
      attendanceApi.markAttendance(data.sessionId, data.records),
    onSuccess: () => {
      setSuccess("Davomat muvaffaqiyatli saqlandi!");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Davomatni saqlashda xatolik");
    },
  });

  const fetchExistingSession = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await attendanceApi.getSessions(today);
      const sessions = res.data.data;
      const existing = sessions.find(
        (s) => s.scheduleId === scheduleId || (s as unknown as { scheduleId: { _id: string } }).scheduleId?._id === scheduleId
      );
      if (existing) {
        setSessionId(existing._id);
        // Load existing records
        const attRes = await attendanceApi.getSessionAttendance(existing._id);
        const existingRecords = attRes.data.data;
        if (existingRecords.length > 0 && students) {
          setRecords(
            students.map((s: Student) => {
              const found = existingRecords.find(
                (r) => (typeof r.studentId === "object" ? (r.studentId as Student)._id : r.studentId) === s._id
              );
              return {
                studentId: s._id,
                status: found ? found.status : ("PRESENT" as AttendanceStatus),
              };
            })
          );
        }
      }
    } catch {
      setError("Mavjud sessiyani topishda xatolik");
    }
  };

  const toggleStatus = (studentId: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.studentId !== studentId) return r;
        const order: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT"];
        const idx = order.indexOf(r.status);
        return { ...r, status: order[(idx + 1) % 3] };
      })
    );
  };

  const handleSubmit = () => {
    if (!sessionId) {
      setError("Avval sessiyani oching");
      return;
    }
    markAttendance.mutate({ sessionId, records });
  };

  const statusConfig: Record<AttendanceStatus, { label: string; color: string; bgcolor: string; icon: React.ReactNode }> = {
    PRESENT: { label: "Keldi", color: "#10B981", bgcolor: "#ECFDF5", icon: <CheckCircle sx={{ fontSize: 18 }} /> },
    ABSENT: { label: "Kelmadi", color: "#EF4444", bgcolor: "#FEF2F2", icon: <Cancel sx={{ fontSize: 18 }} /> },
    LATE: { label: "Kechikdi", color: "#F59E0B", bgcolor: "#FFFBEB", icon: <AccessTime sx={{ fontSize: 18 }} /> },
  };

  const getSubjectName = (id: string | { name: string }) => {
    if (typeof id === "object") return id.name;
    return "";
  };

  const getClassName = (id: string | { grade: string; section: string }) => {
    if (typeof id === "object") return `${id.grade}-${id.section}`;
    return "";
  };

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;

  if (!scheduleId) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Jadval topilmadi</Typography>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>Orqaga</Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <IconButton size="small" onClick={() => router.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Davomat olish
        </Typography>
      </Box>

      {/* Schedule Info */}
      {loadingSchedule ? (
        <Box sx={{ px: 2.5 }}>
          <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
        </Box>
      ) : schedule ? (
        <Box sx={{ px: 2.5, mb: 2 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid #F1F5F9",
              borderLeft: "4px solid #4F46E5",
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="body1" fontWeight={700}>
                {getSubjectName(schedule.subjectId)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getClassName(schedule.classId as string | { grade: string; section: string })} • {schedule.period}-dars • {schedule.startTime} - {schedule.endTime}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ) : null}

      {/* Errors / Success */}
      {error && (
        <Box sx={{ px: 2.5, mb: 2 }}>
          <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
        </Box>
      )}
      {success && (
        <Box sx={{ px: 2.5, mb: 2 }}>
          <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
        </Box>
      )}

      {/* Open Session Button */}
      {!sessionId && (
        <Box sx={{ px: 2.5, mb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => openSession.mutate()}
            disabled={openSession.isPending}
            sx={{
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            {openSession.isPending ? (
              <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
            ) : null}
            Sessiyani boshlash
          </Button>
        </Box>
      )}

      {/* Stats Summary */}
      {records.length > 0 && (
        <Box sx={{ px: 2.5, mb: 2, display: "flex", gap: 1 }}>
          <Chip
            icon={<CheckCircle sx={{ fontSize: 14 }} />}
            label={`${presentCount} keldi`}
            size="small"
            sx={{ bgcolor: "#ECFDF5", color: "#10B981", fontWeight: 600, fontSize: "0.7rem" }}
          />
          <Chip
            icon={<AccessTime sx={{ fontSize: 14 }} />}
            label={`${lateCount} kechikdi`}
            size="small"
            sx={{ bgcolor: "#FFFBEB", color: "#F59E0B", fontWeight: 600, fontSize: "0.7rem" }}
          />
          <Chip
            icon={<Cancel sx={{ fontSize: 14 }} />}
            label={`${absentCount} kelmadi`}
            size="small"
            sx={{ bgcolor: "#FEF2F2", color: "#EF4444", fontWeight: 600, fontSize: "0.7rem" }}
          />
        </Box>
      )}

      {/* Student List */}
      {loadingStudents ? (
        <Box sx={{ px: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      ) : (
        <Box sx={{ px: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {students?.map((student: Student, idx: number) => {
            const record = records.find((r) => r.studentId === student._id);
            const status = record?.status || "PRESENT";
            const config = statusConfig[status];

            return (
              <Card
                key={student._id}
                onClick={() => sessionId && toggleStatus(student._id)}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  border: "1px solid #F1F5F9",
                  cursor: sessionId ? "pointer" : "default",
                  opacity: sessionId ? 1 : 0.6,
                  "&:active": sessionId ? { transform: "scale(0.98)" } : {},
                  transition: "transform 0.1s",
                }}
              >
                <CardContent
                  sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "#F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.7rem",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Typography>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "#4F46E5",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {student.firstName[0]}{student.lastName[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {student.firstName} {student.lastName}
                    </Typography>
                  </Box>
                  <Chip
                    icon={config.icon as React.ReactElement}
                    label={config.label}
                    size="small"
                    sx={{
                      height: 28,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      bgcolor: config.bgcolor,
                      color: config.color,
                      "& .MuiChip-icon": { color: config.color },
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Submit Button */}
      {sessionId && records.length > 0 && (
        <Box sx={{ px: 2.5, py: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={markAttendance.isPending}
            startIcon={markAttendance.isPending ? <CircularProgress size={18} sx={{ color: "white" }} /> : <Send />}
            sx={{
              bgcolor: "#10B981",
              "&:hover": { bgcolor: "#059669" },
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {markAttendance.isPending ? "Saqlanmoqda..." : "Davomatni saqlash"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default function TakeAttendancePage() {
  return (
    <Suspense fallback={<Box sx={{ p: 3, textAlign: "center" }}><CircularProgress /></Box>}>
      <TakeAttendanceContent />
    </Suspense>
  );
}
