import api from "@/lib/axios";
import { ApiResponse, Class } from "@/types";

export const classesApi = {
  getAll: () => api.get<ApiResponse<Class[]>>("/classes"),
  getById: (id: string) => api.get<ApiResponse<Class>>(`/classes/${id}`),
  create: (data: { name: string; grade: string; section: string }) =>
    api.post<ApiResponse<Class>>("/classes", data),
  update: (id: string, data: Partial<Class>) =>
    api.patch<ApiResponse<Class>>(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
};
