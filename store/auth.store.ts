import { create } from "zustand";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  schoolId: string;
  avatar?: string;
  isActive: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  updateUser: (data) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...data };
      localStorage.setItem("user", JSON.stringify(updated));
      set({ user: updated });
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
  hydrate: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) });
    }
  },
}));
