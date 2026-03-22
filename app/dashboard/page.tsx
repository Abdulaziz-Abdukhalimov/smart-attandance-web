"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Skeleton,
  Button,
} from "@mui/material";
import {
  People,
  School,
  Class,
  TrendingUp,
  Notifications,
  CalendarMonth,
  MenuBook,
  ChevronRight,
  AccessTime,
  PlayArrow,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useTeachers } from "@/hooks/useTeachers";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useIsAdmin } from "@/hooks/useRole";
import { useMyTodaySchedule } from "@/hooks/useSchedules";
import ProfileDialog from "@/components/ProfileDialog";
import { Schedule, Teacher, Subject } from "@/types";

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  loading?: boolean;
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #F1F5F9",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
            color,
          }}
        >
          {icon}
        </Box>
        {loading ? (
          <Skeleton width={60} height={32} />
        ) : (
          <Typography variant="h5" fontWeight={700} color="#0F172A">
            {value}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: teachers, isLoading: loadingTeachers } = useTeachers();
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: classes, isLoading: loadingClasses } = useClasses();
  const { data: todaySchedules, isLoading: loadingSchedules } = useMyTodaySchedule();

  const teacherCount = teachers?.length ?? 0;
  const studentCount = students?.length ?? 0;
  const classCount = classes?.length ?? 0;

  const getSubjectName = (id: string | Subject) => {
    if (typeof id === "object") return id.name;
    return "";
  };

  const getClassName = (id: string | { grade: string; section: string }) => {
    if (typeof id === "object") return `${id.grade}-${id.section}`;
    return "";
  };

  const getTeacherName = (id: string | Teacher) => {
    if (typeof id === "object") return id.fullName;
    return "";
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Bosh sahifa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin ? "Admin panel" : `Xush kelibsiz, ${user?.fullName?.split(" ")[0] || ""}!`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small">
            <Notifications sx={{ color: "#64748B" }} />
          </IconButton>
          <Avatar
            onClick={() => setProfileOpen(true)}
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#4F46E5",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "A"}
          </Avatar>
        </Box>
      </Box>

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Teacher: Today's Schedule */}
      {!isAdmin && (
        <Box sx={{ px: 2.5, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Bugungi darslarim
          </Typography>

          {loadingSchedules && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 3 }} />
              ))}
            </Box>
          )}

          {!loadingSchedules && (!todaySchedules || todaySchedules.length === 0) && (
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                border: "1px solid #F1F5F9",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Bugun darslar yo&apos;q
                </Typography>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {todaySchedules?.map((schedule: Schedule) => (
              <Card
                key={schedule._id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  border: "1px solid #F1F5F9",
                  borderLeft: "4px solid #4F46E5",
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Chip
                          label={`${schedule.period}-dars`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            bgcolor: "#EEF2FF",
                            color: "#4F46E5",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {getSubjectName(schedule.subjectId)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getClassName(schedule.classId as string | { grade: string; section: string })}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                        <AccessTime sx={{ fontSize: 14, color: "#94A3B8" }} />
                        <Typography variant="caption" color="text.secondary">
                          {schedule.startTime} - {schedule.endTime}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow sx={{ fontSize: 16 }} />}
                      onClick={() => router.push(`/dashboard/attendance/take?scheduleId=${schedule._id}`)}
                      sx={{
                        bgcolor: "#10B981",
                        "&:hover": { bgcolor: "#059669" },
                        borderRadius: 2,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 1.5,
                        py: 0.8,
                      }}
                    >
                      Davomat
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Admin: Stat Cards */}
      {isAdmin && (
        <Box
          sx={{
            px: 2.5,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
          }}
        >
          <StatCard
            label="O'qituvchilar"
            value={teacherCount}
            icon={<People sx={{ fontSize: 22 }} />}
            color="#4F46E5"
            bgColor="#EEF2FF"
            loading={loadingTeachers}
          />
          <StatCard
            label="O'quvchilar"
            value={studentCount}
            icon={<School sx={{ fontSize: 22 }} />}
            color="#10B981"
            bgColor="#ECFDF5"
            loading={loadingStudents}
          />
          <StatCard
            label="Sinflar"
            value={classCount}
            icon={<Class sx={{ fontSize: 22 }} />}
            color="#F59E0B"
            bgColor="#FFFBEB"
            loading={loadingClasses}
          />
          <StatCard
            label="Davomat %"
            value="—"
            icon={<TrendingUp sx={{ fontSize: 22 }} />}
            color="#8B5CF6"
            bgColor="#F5F3FF"
          />
        </Box>
      )}

      {/* Admin: Weekly Attendance */}
      {isAdmin && (
        <Box sx={{ px: 2.5, mt: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid #F1F5F9",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Haftalik Davomat
                </Typography>
                <Chip
                  icon={<CalendarMonth sx={{ fontSize: 14 }} />}
                  label="Shu hafta"
                  size="small"
                  sx={{
                    bgcolor: "#EEF2FF",
                    color: "#4F46E5",
                    fontWeight: 500,
                    fontSize: "0.7rem",
                  }}
                />
              </Box>

              {studentCount === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hali ma&apos;lumot yo&apos;q. Avval o&apos;quvchilar qo&apos;shing.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                  {["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma"].map(
                    (day) => (
                      <Box
                        key={day}
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ width: 80, flexShrink: 0 }}
                        >
                          {day}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={0}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: "#F1F5F9",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 3,
                              bgcolor: "#E2E8F0",
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{ width: 32, textAlign: "right" }}
                        >
                          —
                        </Typography>
                      </Box>
                    )
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Teacher: Today's Schedule Summary for Admin */}
      {isAdmin && todaySchedules && todaySchedules.length > 0 && (
        <Box sx={{ px: 2.5, mt: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Bugungi darslar
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {todaySchedules.slice(0, 5).map((schedule: Schedule) => (
              <Card
                key={schedule._id}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  border: "1px solid #F1F5F9",
                }}
              >
                <CardContent
                  sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <Chip
                    label={`${schedule.period}`}
                    size="small"
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      bgcolor: "#EEF2FF",
                      color: "#4F46E5",
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {getSubjectName(schedule.subjectId)} • {getClassName(schedule.classId as string | { grade: string; section: string })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getTeacherName(schedule.teacherId)} • {schedule.startTime} - {schedule.endTime}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Quick Links */}
      <Box sx={{ px: 2.5, mt: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          Tezkor havolalar
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            ...(isAdmin
              ? [
                  { label: "Sinflar", desc: `${classCount} ta sinf`, icon: <Class sx={{ fontSize: 20 }} />, color: "#F59E0B", path: "/dashboard/classes" },
                  { label: "Fanlar", desc: "Fanlar ro'yxati", icon: <MenuBook sx={{ fontSize: 20 }} />, color: "#EC4899", path: "/dashboard/subjects" },
                ]
              : []),
            { label: "Dars jadvali", desc: "Jadval ko'rish", icon: <CalendarMonth sx={{ fontSize: 20 }} />, color: "#06B6D4", path: "/dashboard/schedules" },
            { label: "Davomat", desc: "Davomat tarixi", icon: <TrendingUp sx={{ fontSize: 20 }} />, color: "#8B5CF6", path: "/dashboard/attendance" },
          ].map((item) => (
            <Card
              key={item.path}
              onClick={() => router.push(item.path)}
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                border: "1px solid #F1F5F9",
                cursor: "pointer",
                "&:active": { transform: "scale(0.98)" },
                transition: "transform 0.1s",
              }}
            >
              <CardContent
                sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: `${item.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                </Box>
                <ChevronRight sx={{ color: "#CBD5E1", fontSize: 20 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
