import api from "@/lib/axios";
import { ApiResponse, Subject } from "@/types";

export const subjectsApi = {
  getAll: () => api.get<ApiResponse<Subject[]>>("/subjects"),
  getById: (id: string) => api.get<ApiResponse<Subject>>(`/subjects/${id}`),
  create: (data: { name: string }) =>
    api.post<ApiResponse<Subject>>("/subjects", data),
  update: (id: string, data: Partial<Subject>) =>
    api.patch<ApiResponse<Subject>>(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};
