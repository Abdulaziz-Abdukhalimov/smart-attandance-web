import api from "@/lib/axios";
import { ApiResponse, AttendanceSession, Attendance, AttendanceStatus } from "@/types";

export const attendanceApi = {
  openSession: (scheduleId: string) =>
    api.post<ApiResponse<AttendanceSession>>("/attendance/sessions", { scheduleId }),
  getSessions: (date?: string) =>
    api.get<ApiResponse<AttendanceSession[]>>("/attendance/sessions", { params: date ? { date } : {} }),
  getSessionAttendance: (sessionId: string) =>
    api.get<ApiResponse<Attendance[]>>(`/attendance/sessions/${sessionId}`),
  markAttendance: (sessionId: string, records: { studentId: string; status: AttendanceStatus }[]) =>
    api.post<ApiResponse<Attendance[]>>(`/attendance/sessions/${sessionId}/mark`, { records }),
  updateAttendance: (attendanceId: string, status: AttendanceStatus) =>
    api.patch<ApiResponse<Attendance>>(`/attendance/${attendanceId}`, { status }),
  getStudentAttendance: (studentId: string, date?: string) =>
    api.get<ApiResponse<Attendance[]>>(`/attendance/students/${studentId}`, { params: date ? { date } : {} }),
};
