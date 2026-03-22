import api from "@/lib/axios";
import { SignupFormData, LoginFormData } from "@/lib/validations/auth.schema";
import { ApiResponse } from "@/types";
import { User } from "@/store/auth.store";

interface AuthData {
  token: string;
  user: User;
}

export const authApi = {
  signup: (data: SignupFormData) => api.post<ApiResponse<AuthData>>("/auth/signup", data),
  login: (data: LoginFormData) => api.post<ApiResponse<AuthData>>("/auth/login", data),
};
