import { useMutation, useQuery } from "@tanstack/react-query";
import useDashboardService from "services/dashboardassist.service";

type GenerateDashboardPayload = {
  prompt: string;
  preview: boolean;
};

type UploadDashboardPayload = {
  prompt: string;
  dashboard: any;
};

export function useGenerateDashboard() {
  const { generateDashboard } = useDashboardService();

  const mutation = useMutation({
    mutationFn: (payload: GenerateDashboardPayload) => generateDashboard(payload),
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isError: mutation.isError,
    error: mutation.error,
    isLoading: mutation.isPending,
  };
}

export function useUploadDashboard() {
  const { uploadDashboard } = useDashboardService();

  const mutation = useMutation({
    mutationFn: (payload: UploadDashboardPayload) => uploadDashboard(payload),
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isError: mutation.isError,
    error: mutation.error,
    isLoading: mutation.isPending,
  };
}

export function useGetDashboardHistory() {
  const { getHistory } = useDashboardService();

  return useQuery({
    queryKey: ["dashboard-history"],
    queryFn: getHistory,
  });
}
