import { useMutation, useQuery } from "@tanstack/react-query";
import useTraceAssistService from "services/traceassist.service";

import {
  CreateDeploymentRequest,
  Deployment,
  GrafanaDashboardRequest,
  GrafanaDashboardResponse,
} from "../interfaces/traceAssist";

export function useCreateDeployment() {
  const { createDeployment } = useTraceAssistService();

  const { mutateAsync, isError, error, isPending } = useMutation({
    mutationFn: (obj: CreateDeploymentRequest) => createDeployment(obj),
  });

  return {
    mutateAsync,
    isError,
    error,
    isLoading: isPending,
  };
}

export function useGetDeploymentDetails(deploymentName: string) {
  const { getDeploymentDetails } = useTraceAssistService();

  return useQuery({
    queryKey: ["deployment-details", deploymentName],
    queryFn: () => getDeploymentDetails(deploymentName),
    enabled: !!deploymentName,
  });
}

export function useInstrumentDeployment() {
  const { instrumentDeployment } = useTraceAssistService();

  const { mutateAsync, isError, error, isPending } = useMutation({
    mutationFn: (params: { deploymentName: string; pat_token: string }) =>
      instrumentDeployment(params),
  });

  return {
    mutateAsync,
    isError,
    error,
    isLoading: isPending,
  };
}

export function useGetAllDeployments() {
  const { getAllDeployments } = useTraceAssistService();

  return useQuery<Deployment[]>({
    queryKey: ["all-deployments"],
    queryFn: getAllDeployments,
  });
}

