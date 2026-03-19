import api from "@/lib/axios";
import { SignupFormData, LoginFormData } from "@/lib/validations/auth.schema";

export const authApi = {
  signup: (data: SignupFormData) => api.post("/auth/signup", data),
  login: (data: LoginFormData) => api.post<{ access_token: string }>("/auth/login", data),
};
