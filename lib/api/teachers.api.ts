import api from "@/lib/axios";
import { ApiResponse, Teacher } from "@/types";

export const teachersApi = {
  getAll: () => api.get<ApiResponse<Teacher[]>>("/teachers"),
  getById: (id: string) => api.get<ApiResponse<Teacher>>(`/teachers/${id}`),
  create: (data: { fullName: string; email: string; phone: string; password: string; role: string }) =>
    api.post<ApiResponse<Teacher>>("/teachers", data),
  update: (id: string, data: Partial<Teacher>) =>
    api.patch<ApiResponse<Teacher>>(`/teachers/${id}`, data),
  delete: (id: string) => api.delete(`/teachers/${id}`),
};
