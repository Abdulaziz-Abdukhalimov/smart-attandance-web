import { z } from "zod";

export const signupSchema = z.object({
  schoolName: z.string().min(2, "Maktab nomi kiritilishi shart"),
  schoolAddress: z.string().min(2, "Manzil kiritilishi shart"),
  schoolPhone: z.string().min(9, "Telefon raqam kiritilishi shart"),
  fullName: z.string().min(2, "To'liq ism kiritilishi shart"),
  email: z.string().email("Email noto'g'ri formatda"),
  phone: z.string().min(9, "Telefon raqam kiritilishi shart"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

export const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
