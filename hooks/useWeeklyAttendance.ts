import { useQuery } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api/attendance.api";
import { formatDateLocal } from "@/lib/date";
import { Attendance } from "@/types";

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1));

  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDateLocal(d));
  }
  return dates;
}

export interface DayAttendance {
  date: string;
  total: number;
  present: number;
  percentage: number;
}

export function useWeeklyAttendance() {
  const weekDates = getWeekDates();

  return useQuery({
    queryKey: ["weekly-attendance", weekDates[0]],
    queryFn: async () => {
      const results: DayAttendance[] = [];

      for (const date of weekDates) {
        try {
          const sessionsRes = await attendanceApi.getSessions(date);
          const sessions = sessionsRes.data.data;

          let totalRecords = 0;
          let presentRecords = 0;

          for (const session of sessions) {
            const attRes = await attendanceApi.getSessionAttendance(session._id);
            const records: Attendance[] = attRes.data.data;
            totalRecords += records.length;
            presentRecords += records.filter(
              (r) => r.status === "PRESENT" || r.status === "LATE"
            ).length;
          }

          results.push({
            date,
            total: totalRecords,
            present: presentRecords,
            percentage: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0,
          });
        } catch {
          results.push({ date, total: 0, present: 0, percentage: 0 });
        }
      }

      return results;
    },
    staleTime: 5 * 60 * 1000,
  });
}
