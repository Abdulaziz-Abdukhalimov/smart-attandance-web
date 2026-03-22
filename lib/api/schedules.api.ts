import api from "@/lib/axios";
import { ApiResponse, Schedule } from "@/types";

interface CreateScheduleData {
  teacherId: string;
  classId: string;
  subjectId: string;
  weekday: number;
  period: number;
  startTime: string;
  endTime: string;
}

export const schedulesApi = {
  getAll: () => api.get<ApiResponse<Schedule[]>>("/schedules"),
  getById: (id: string) => api.get<ApiResponse<Schedule>>(`/schedules/${id}`),
  getMyToday: () => api.get<ApiResponse<Schedule[]>>("/schedules/my/today"),
  getMyWeekly: (weekday?: number) =>
    api.get<ApiResponse<Schedule[]>>("/schedules/my/weekly", { params: weekday ? { weekday } : {} }),
  create: (data: CreateScheduleData) => api.post<ApiResponse<Schedule>>("/schedules", data),
  update: (id: string, data: Partial<CreateScheduleData>) =>
    api.patch<ApiResponse<Schedule>>(`/schedules/${id}`, data),
  delete: (id: string) => api.delete(`/schedules/${id}`),
};
