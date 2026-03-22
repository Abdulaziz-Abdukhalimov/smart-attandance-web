// API wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// Models
export interface School {
  _id: string;
  name: string;
  address: string;
  phone: string;
  logo?: string;
  subscriptionPlan: "FREE" | "BASIC" | "PREMIUM";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  _id: string;
  schoolId: string;
  fullName: string;
  email: string;
  phone: string;
  role: TeacherRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  _id: string;
  schoolId: string;
  name: string;
  grade: string;
  section: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  schoolId: string;
  classId: string | Class;
  firstName: string;
  lastName: string;
  connectCode: string;
  parentIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  _id: string;
  schoolId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  schoolId: string;
  teacherId: string | Teacher;
  classId: string | Class;
  subjectId: string | Subject;
  weekday: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSession {
  _id: string;
  schoolId: string;
  scheduleId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  date: string;
  period: number;
  openedAt: string;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  sessionId: string;
  schoolId: string;
  studentId: string | Student;
  teacherId: string;
  classId: string;
  subjectId: string;
  date: string;
  period: number;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

// Enums
export type TeacherRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}
