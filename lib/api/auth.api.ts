import api from "@/lib/axios";
import { SignupFormData, LoginFormData } from "@/lib/validations/auth.schema";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface AuthData {
  token: string;
  user: {
    _id: string;
    schoolId: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  signup: (data: SignupFormData) => api.post<ApiResponse<AuthData>>("/auth/signup", data),
  login: (data: LoginFormData) => api.post<ApiResponse<AuthData>>("/auth/login", data),
};
