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
} from "@mui/material";
import { ChevronLeft, ChevronRight, CheckCircle, Cancel, AccessTime } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api/attendance.api";
import { AttendanceSession } from "@/types";

const statusConfig = {
  PRESENT: { label: "Keldi", color: "#10B981", icon: <CheckCircle sx={{ fontSize: 16 }} /> },
  ABSENT: { label: "Kelmadi", color: "#EF4444", icon: <Cancel sx={{ fontSize: 16 }} /> },
  LATE: { label: "Kechikdi", color: "#F59E0B", icon: <AccessTime sx={{ fontSize: 16 }} /> },
};

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = formatDate(selectedDate);

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

        {formatDate(selectedDate) !== formatDate(new Date()) && (
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
            <Card
              key={session._id}
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                border: "1px solid #F1F5F9",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {session.period}-dars
                  </Typography>
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
                <Typography variant="caption" color="text.secondary">
                  Sana: {session.date} | Dars: {session.period}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
