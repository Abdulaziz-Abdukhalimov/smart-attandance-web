"use client";

import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
} from "@mui/material";
import {
  People,
  School,
  Class,
  TrendingUp,
  Notifications,
  CalendarMonth,
} from "@mui/icons-material";
import { useAuthStore } from "@/store/auth.store";

const statCards = [
  {
    label: "O'qituvchilar",
    value: "42",
    icon: <People sx={{ fontSize: 22 }} />,
    color: "#4F46E5",
    bgColor: "#EEF2FF",
  },
  {
    label: "O'quvchilar",
    value: "1,240",
    icon: <School sx={{ fontSize: 22 }} />,
    color: "#10B981",
    bgColor: "#ECFDF5",
  },
  {
    label: "Sinflar",
    value: "36",
    icon: <Class sx={{ fontSize: 22 }} />,
    color: "#F59E0B",
    bgColor: "#FFFBEB",
  },
  {
    label: "Davomat %",
    value: "94%",
    icon: <TrendingUp sx={{ fontSize: 22 }} />,
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
];

const recentActivities = [
  {
    name: "Yangi o'quvchi qo'shildi",
    description: "Azizov Bobur - 9-A sinf",
    time: "10 daqiqa oldin",
    type: "success" as const,
  },
  {
    name: "Past davomat xabarnomasi",
    description: "10-B sinf - 78% davomat",
    time: "30 daqiqa oldin",
    type: "warning" as const,
  },
  {
    name: "Hisobot tayyor",
    description: "Haftalik davomat hisoboti",
    time: "1 soat oldin",
    type: "info" as const,
  },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

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
            Xush kelibsiz!
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small">
            <Notifications sx={{ color: "#64748B" }} />
          </IconButton>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#4F46E5",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </Avatar>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Box
        sx={{
          px: 2.5,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.5,
        }}
      >
        {statCards.map((stat) => (
          <Card
            key={stat.label}
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
                  bgcolor: stat.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: "#0F172A" }}
              >
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Weekly Attendance */}
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

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: `conic-gradient(#10B981 0% 92%, #E2E8F0 92% 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      bgcolor: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} color="#0F172A">
                      92%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Day breakdown */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              {[
                { day: "Dushanba", value: 95 },
                { day: "Seshanba", value: 91 },
                { day: "Chorshanba", value: 89 },
                { day: "Payshanba", value: 93 },
                { day: "Juma", value: 90 },
              ].map((item) => (
                <Box
                  key={item.day}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 80, flexShrink: 0 }}
                  >
                    {item.day}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "#F1F5F9",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        bgcolor:
                          item.value >= 90 ? "#10B981" : "#F59E0B",
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ width: 32, textAlign: "right" }}
                  >
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Activities */}
      <Box sx={{ px: 2.5, mt: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          So&apos;ngi faoliyatlar
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {recentActivities.map((activity, idx) => (
            <Card
              key={idx}
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
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor:
                      activity.type === "success"
                        ? "#10B981"
                        : activity.type === "warning"
                        ? "#F59E0B"
                        : "#4F46E5",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {activity.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.description}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0 }}
                >
                  {activity.time}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
