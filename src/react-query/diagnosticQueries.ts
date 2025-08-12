import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { useDiagnosticService } from "services";

function useGetDiagnosticsVersionsList(serviceEnvId: number) {
  const { getDiagnosticsVersionsList } = useDiagnosticService();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_DIAGNOSTICS_VERSIONS_LIST, serviceEnvId],
    queryFn: () => getDiagnosticsVersionsList(serviceEnvId),
    enabled: !!serviceEnvId,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}

function useGetApplicationDiagnosticsReport(
  serviceEnvId: number,
  version: string,
) {
  const { getDiagnosticsReport } = useDiagnosticService();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_DIAGNOSTICS_REPORT, serviceEnvId, version],
    queryFn: () => getDiagnosticsReport(serviceEnvId, version),
    refetchOnWindowFocus: false,
    enabled: serviceEnvId !== null && version !== null,
    retry: 3,
    gcTime: 0,
    refetchInterval(query) {
      return query?.state?.data?.scanStatus === "InProgress" ||
        query?.state?.data?.scanStatus === "Pending"
        ? 10 * 1000
        : false;
    },
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
}

function useRunDiagnostics() {
  const { runDiagnostics } = useDiagnosticService();

  const { mutateAsync, isError, isPending, error } = useMutation({
    mutationFn: (serviceEnvId: number) => runDiagnostics(serviceEnvId),
  });

  return {
    mutateAsync,
    isError,
    isLoading: isPending,
    error,
  };
}

export {
  useGetDiagnosticsVersionsList,
  useGetApplicationDiagnosticsReport,
  useRunDiagnostics,
};
