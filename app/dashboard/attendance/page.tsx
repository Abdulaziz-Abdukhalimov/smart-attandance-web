"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Skeleton,
  Button,
  Avatar,
  Collapse,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Cancel,
  AccessTime,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api/attendance.api";
import { formatDateLocal, formatDisplayDate } from "@/lib/date";
import { AttendanceSession, Attendance, Student } from "@/types";

const statusConfig: Record<string, { label: string; color: string; bgcolor: string; icon: React.ReactNode }> = {
  PRESENT: { label: "Keldi", color: "#10B981", bgcolor: "#ECFDF5", icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  ABSENT: { label: "Kelmadi", color: "#EF4444", bgcolor: "#FEF2F2", icon: <Cancel sx={{ fontSize: 14 }} /> },
  LATE: { label: "Kechikdi", color: "#F59E0B", bgcolor: "#FFFBEB", icon: <AccessTime sx={{ fontSize: 14 }} /> },
};

function SessionCard({ session }: { session: AttendanceSession }) {
  const [expanded, setExpanded] = useState(false);

  const { data: records, isLoading } = useQuery({
    queryKey: ["session-attendance", session._id],
    queryFn: async () => {
      const res = await attendanceApi.getSessionAttendance(session._id);
      return res.data.data;
    },
    enabled: expanded,
  });

  const subjectName = typeof session.subjectId === "object" ? session.subjectId.name : "";
  const className = typeof session.classId === "object"
    ? `${session.classId.grade}-${session.classId.section}`
    : "";

  const presentCount = records?.filter((r: Attendance) => r.status === "PRESENT").length ?? 0;
  const absentCount = records?.filter((r: Attendance) => r.status === "ABSENT").length ?? 0;
  const lateCount = records?.filter((r: Attendance) => r.status === "LATE").length ?? 0;
  const total = records?.length ?? 0;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #F1F5F9",
        borderLeft: "4px solid #4F46E5",
      }}
    >
      <CardContent
        sx={{
          p: 2,
          "&:last-child": { pb: 2 },
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Chip
                label={`${session.period}-dars`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: "#EEF2FF",
                  color: "#4F46E5",
                }}
              />
              <Chip
                label={session.isClosed ? "Yopilgan" : "Ochiq"}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: session.isClosed ? "#FEE2E2" : "#ECFDF5",
                  color: session.isClosed ? "#EF4444" : "#10B981",
                }}
              />
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {subjectName || `${session.period}-dars`}
            </Typography>
            {className && (
              <Typography variant="caption" color="text.secondary">
                {className}
              </Typography>
            )}
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {/* Summary chips when expanded and records loaded */}
        {expanded && records && total > 0 && (
          <Box sx={{ display: "flex", gap: 0.8, mt: 1.5, flexWrap: "wrap" }}>
            <Chip
              icon={<CheckCircle sx={{ fontSize: 12 }} />}
              label={`${presentCount}/${total}`}
              size="small"
              sx={{ height: 24, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#ECFDF5", color: "#10B981", "& .MuiChip-icon": { color: "#10B981" } }}
            />
            <Chip
              icon={<AccessTime sx={{ fontSize: 12 }} />}
              label={`${lateCount}`}
              size="small"
              sx={{ height: 24, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#FFFBEB", color: "#F59E0B", "& .MuiChip-icon": { color: "#F59E0B" } }}
            />
            <Chip
              icon={<Cancel sx={{ fontSize: 12 }} />}
              label={`${absentCount}`}
              size="small"
              sx={{ height: 24, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#FEF2F2", color: "#EF4444", "& .MuiChip-icon": { color: "#EF4444" } }}
            />
          </Box>
        )}
      </CardContent>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          {isLoading && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          )}

          {!isLoading && (!records || records.length === 0) && (
            <Typography variant="caption" color="text.secondary">
              Davomat ma&apos;lumotlari topilmadi
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {records?.map((record: Attendance, idx: number) => {
              const student = record.studentId as Student;
              const firstName = typeof student === "object" ? student.firstName : "";
              const lastName = typeof student === "object" ? student.lastName : "";
              const config = statusConfig[record.status];

              return (
                <Box
                  key={record._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 0.8,
                    px: 1,
                    borderRadius: 2,
                    bgcolor: idx % 2 === 0 ? "#F8FAFC" : "transparent",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      width: 20,
                      fontWeight: 600,
                      color: "#94A3B8",
                      fontSize: "0.7rem",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Typography>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "#4F46E5",
                      fontSize: "0.6rem",
                      fontWeight: 600,
                    }}
                  >
                    {firstName?.[0]}{lastName?.[0]}
                  </Avatar>
                  <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }} noWrap>
                    {firstName} {lastName}
                  </Typography>
                  <Chip
                    icon={config.icon as React.ReactElement}
                    label={config.label}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      bgcolor: config.bgcolor,
                      color: config.color,
                      "& .MuiChip-icon": { color: config.color },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = formatDateLocal(selectedDate);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["attendance-sessions", dateStr],
    queryFn: async () => {
      const res = await attendanceApi.getSessions(dateStr);
      return res.data.data;
    },
  });

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const today = () => setSelectedDate(new Date());

  return (
    <Box>
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Davomat
        </Typography>

        {/* Date Picker */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #F1F5F9",
            mb: 2,
          }}
        >
          <CardContent
            sx={{
              p: 2,
              "&:last-child": { pb: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <IconButton size="small" onClick={prevDay}>
              <ChevronLeft />
            </IconButton>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" fontWeight={600}>
                {formatDisplayDate(selectedDate)}
              </Typography>
            </Box>
            <IconButton size="small" onClick={nextDay}>
              <ChevronRight />
            </IconButton>
          </CardContent>
        </Card>

        {formatDateLocal(selectedDate) !== formatDateLocal(new Date()) && (
          <Button
            size="small"
            onClick={today}
            sx={{ mb: 2, color: "#4F46E5", fontWeight: 600 }}
          >
            Bugun
          </Button>
        )}

        {isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        )}

        {!isLoading && (!sessions || sessions.length === 0) && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Bu kunga davomat sessiyalari topilmadi
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {sessions?.map((session: AttendanceSession) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
