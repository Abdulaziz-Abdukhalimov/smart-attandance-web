"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Skeleton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  AccessTime,
  Save,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesApi } from "@/lib/api/schedules.api";
import { studentsApi } from "@/lib/api/students.api";
import { attendanceApi } from "@/lib/api/attendance.api";
import { Student, AttendanceStatus } from "@/types";
import { formatDateLocal } from "@/lib/date";

type StudentRecord = {
  studentId: string;
  status: AttendanceStatus;
};

const statusButtons: { value: AttendanceStatus; label: string; color: string; activeColor: string; activeBg: string }[] = [
  { value: "PRESENT", label: "Keldi", color: "#64748B", activeColor: "#fff", activeBg: "#10B981" },
  { value: "ABSENT", label: "Kelmadi", color: "#64748B", activeColor: "#fff", activeBg: "#EF4444" },
  { value: "LATE", label: "Kechikdi", color: "#64748B", activeColor: "#fff", activeBg: "#F59E0B" },
];

function TakeAttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const scheduleId = searchParams.get("scheduleId") || "";

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [error, setError] = useState("");

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
      if (msg.includes("already") || msg.includes("exists") || msg.includes("mavjud") || msg.includes("Session already")) {
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
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      router.push("/dashboard/attendance");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Davomatni saqlashda xatolik");
    },
  });

  const fetchExistingSession = async () => {
    try {
      const today = formatDateLocal(new Date());
      const res = await attendanceApi.getSessions(today);
      const sessions = res.data.data;
      const existing = sessions.find(
        (s) => s.scheduleId === scheduleId || (s as unknown as { scheduleId: { _id: string } }).scheduleId?._id === scheduleId
      );
      if (existing) {
        setSessionId(existing._id);
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

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleSubmit = () => {
    if (!sessionId) {
      setError("Avval sessiyani oching");
      return;
    }
    markAttendance.mutate({ sessionId, records });
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
        <Button onClick={() => router.push("/dashboard")} sx={{ mt: 2 }}>Orqaga</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: sessionId ? "100px" : 0 }}>
      {/* Header with schedule info */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)",
          color: "white",
          px: 2.5,
          pt: 3,
          pb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <IconButton size="small" onClick={() => router.push("/dashboard")} sx={{ color: "white" }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700}>
            Davomat olish
          </Typography>
        </Box>

        {loadingSchedule ? (
          <Skeleton variant="rounded" height={40} sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)" }} />
        ) : schedule ? (
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {getClassName(schedule.classId as string | { grade: string; section: string })} — {getSubjectName(schedule.subjectId)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.3 }}>
              {schedule.period}-dars • {schedule.startTime} - {schedule.endTime} • {new Date().toLocaleDateString("uz-UZ")}
            </Typography>
          </Box>
        ) : null}
      </Box>

      {/* Alerts */}
      {error && (
        <Box sx={{ px: 2.5, mt: 2 }}>
          <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
        </Box>
      )}

      {/* Open Session Button */}
      {!sessionId && (
        <Box sx={{ px: 2.5, mt: 3 }}>
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

      {/* Student List with 3 buttons */}
      <Box sx={{ px: 2.5, mt: 2 }}>
        {loadingStudents ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {students?.map((student: Student, idx: number) => {
              const record = records.find((r) => r.studentId === student._id);
              const currentStatus = record?.status || "PRESENT";

              return (
                <Box
                  key={student._id}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: 3,
                    bgcolor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    border: "1px solid #F1F5F9",
                    opacity: sessionId ? 1 : 0.5,
                  }}
                >
                  {/* First line: number + name */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ width: 20, flexShrink: 0 }}>
                      {idx + 1}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {student.lastName} {student.firstName}
                    </Typography>
                  </Box>

                  {/* Second line: 3 status buttons */}
                  <Box sx={{ display: "flex", gap: 0.8, pl: 3.5 }}>
                    {statusButtons.map((btn) => {
                      const isActive = currentStatus === btn.value;
                      return (
                        <Button
                          key={btn.value}
                          size="small"
                          variant={isActive ? "contained" : "outlined"}
                          disabled={!sessionId}
                          onClick={() => setStatus(student._id, btn.value)}
                          sx={{
                            flex: 1,
                            py: 0.6,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: "none",
                            ...(isActive
                              ? {
                                  bgcolor: btn.activeBg,
                                  color: btn.activeColor,
                                  border: `1px solid ${btn.activeBg}`,
                                  boxShadow: "none",
                                  "&:hover": { bgcolor: btn.activeBg, boxShadow: "none" },
                                }
                              : {
                                  color: "#94A3B8",
                                  borderColor: "#E2E8F0",
                                  bgcolor: "transparent",
                                  "&:hover": { borderColor: btn.activeBg, color: btn.activeBg, bgcolor: "transparent" },
                                }),
                          }}
                        >
                          {btn.label}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Fixed bottom bar with stats + save button */}
      {sessionId && records.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "white",
            borderTop: "1px solid #E2E8F0",
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            zIndex: 1100,
          }}
        >
          {/* Stats */}
          <Box sx={{ flex: 1, display: "flex", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <CheckCircle sx={{ fontSize: 14, color: "#10B981" }} />
              <Typography variant="caption" fontWeight={700} color="#10B981">
                {presentCount}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <Cancel sx={{ fontSize: 14, color: "#EF4444" }} />
              <Typography variant="caption" fontWeight={700} color="#EF4444">
                {absentCount}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <AccessTime sx={{ fontSize: 14, color: "#F59E0B" }} />
              <Typography variant="caption" fontWeight={700} color="#F59E0B">
                {lateCount}
              </Typography>
            </Box>
          </Box>

          {/* Save button */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={markAttendance.isPending}
            startIcon={markAttendance.isPending ? <CircularProgress size={16} sx={{ color: "white" }} /> : <Save />}
            sx={{
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
            }}
          >
            Saqlash
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
