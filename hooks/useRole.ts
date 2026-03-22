import { useAuthStore } from "@/store/auth.store";

export function useIsAdmin() {
  const user = useAuthStore((s) => s.user);
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

export function useUserRole() {
  const user = useAuthStore((s) => s.user);
  return user?.role || "TEACHER";
}
