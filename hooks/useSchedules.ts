import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesApi } from "@/lib/api/schedules.api";

export function useSchedules(enabled = true) {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await schedulesApi.getAll();
      return res.data.data;
    },
    enabled,
  });
}

export function useMyTodaySchedule() {
  return useQuery({
    queryKey: ["schedules", "my", "today"],
    queryFn: async () => {
      const res = await schedulesApi.getMyToday();
      return res.data.data;
    },
  });
}

export function useMyWeeklySchedule(weekday?: number, enabled = true) {
  return useQuery({
    queryKey: ["schedules", "my", "weekly", weekday],
    queryFn: async () => {
      const res = await schedulesApi.getMyWeekly(weekday);
      return res.data.data;
    },
    enabled,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      teacherId: string;
      classId: string;
      subjectId: string;
      weekday: number;
      period: number;
      startTime: string;
      endTime: string;
    }) => schedulesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}
