import api from "@/lib/axios";
import { ApiResponse, Student } from "@/types";

export const studentsApi = {
  getAll: (classId?: string) =>
    api.get<ApiResponse<Student[]>>("/students", { params: classId ? { classId } : {} }),
  getById: (id: string) => api.get<ApiResponse<Student>>(`/students/${id}`),
  create: (data: { firstName: string; lastName: string; classId: string }) =>
    api.post<ApiResponse<Student>>("/students", data),
  update: (id: string, data: Partial<Student>) =>
    api.patch<ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};
