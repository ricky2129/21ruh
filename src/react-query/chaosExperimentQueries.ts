import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { CreateExperimentRequest } from "interfaces";
import { useChaosExperimentsService } from "services";

/**
 * Custom hook to fetch a list of scenarios for chaos experiments.
 * Utilizes React Query to perform the data fetching and manage the loading state.
 *
 * @returns {Object} - An object containing:
 *   - data: The list of scenarios retrieved from the server.
 *   - isLoading: A boolean indicating whether the data is currently being fetched.
 */
const useGetScenarioLists = () => {
  const { getScenarioLists } = useChaosExperimentsService();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_SCENARIO_LISTS],
    queryFn: () => getScenarioLists(),
  });

  return {
    data,
    isLoading,
  };
};

/**
 * Custom hook to fetch the chaos experiment data for a given service environment and version.
 * Utilizes React Query to manage the data fetching and loading state.
 *
 * @param {string} service_env_id - The ID of the service environment for which to fetch the chaos experiment data.
 * @param {string} version - The version of the chaos experiment data to fetch.
 * @returns {Object} - An object containing:
 *   - data: The response from the server.
 *   - isLoading: A boolean indicating whether the data is currently being fetched.
 */
const useGetChaosData = (service_env_id: string, version: string) => {
  const { getChaosData } = useChaosExperimentsService();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_CHAOS_DATA, service_env_id, version],
    queryFn: () => getChaosData(service_env_id, version),
    enabled: !!service_env_id && !!version,
    refetchInterval(query) {
      return query?.state?.data?.result?.final_stage === "Active" ||
        query?.state?.data?.result?.final_stage === "NotStarted"
        ? 20000
        : false;
    },
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    refetch,
  };
};

/**
 * Custom hook to fetch the versions of chaos experiments for a given service environment.
 * Utilizes React Query to manage the data fetching and loading state.
 *
 * @param {string} service_env_id - The ID of the service environment for which to fetch versions.
 * @returns {Object} - An object containing:
 *   - data: An array of version numbers retrieved from the server.
 *   - isLoading: A boolean indicating whether the data is currently being fetched.
 */
const useGetChaosVersions = (service_env_id: string) => {
  const { getVersions } = useChaosExperimentsService();

  const { data, isFetching, refetch, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_CHAOS_VERSIONS, service_env_id],
    queryFn: () => getVersions(service_env_id),
    enabled: !!service_env_id,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
};

const useResrunChaosScan = (service_env_id: string) => {
  const { rerunChaosScan } = useChaosExperimentsService();
  const { data, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEY.RERUN_CHAOS_SCAN, service_env_id],
    queryFn: () => rerunChaosScan(service_env_id),
    enabled: false,
  });

  return {
    data,
    isLoading,
    refetch,
  };
};

/**
 * Custom hook to download the configuration file of a given application service.
 * Utilizes React Query to manage the data fetching and loading state.
 *
 * @param {string} app_service_id - The ID of the application service for which to download the configuration file.
 * @returns {Object} - An object containing:
 *   - data: The configuration file retrieved from the server as a blob.
 *   - isLoading: A boolean indicating whether the data is currently being fetched.
 *   - refetch: A function to call the query again.
 */
const useGetConfigFile = () => {
  const { downloadConfigFile } = useChaosExperimentsService();

  const { data, isPending, mutateAsync } = useMutation({
    mutationFn: (app_service_id: string) => downloadConfigFile(app_service_id),
  });

  return {
    data,
    isLoading: isPending,
    mutateAsync,
  };
};

/**
 * Custom hook to create a new chaos experiment.
 * Utilizes React Query to manage the mutation state.
 *
 * @returns {Object} - An object containing:
 *   - data: The response from the server after creating the experiment.
 *   - isLoading: A boolean indicating whether the mutation is in progress.
 *   - mutateAsync: A function to trigger the mutation with the experiment details.
 */
const useCreateExperiments = () => {
  const { createExperiment } = useChaosExperimentsService();

  const { data, isPending, mutateAsync } = useMutation({
    mutationFn: (obj: CreateExperimentRequest) => createExperiment(obj),
  });

  return {
    data,
    isLoading: isPending,
    mutateAsync,
  };
};

/**
 * Custom hook to fetch the chaos agents for a given service environment.
 * Utilizes React Query to manage the data fetching and loading state.
 *
 * @param {string} app_service_id - The ID of the service environment for which to fetch the chaos agents.
 * @returns {Object} - An object containing:
 *   - isLoading: A boolean indicating whether the data is currently being fetched.
 *   - data: The response from the server.
 *   - refetch: A function to call the query again.
 */
const useGetChaosAgents = (app_service_id: string) => {
  const { getChaosAgents } = useChaosExperimentsService();

  const { isLoading, data, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_CHAOS_AGENTS, app_service_id],
    queryFn: () => getChaosAgents(app_service_id),
    enabled: !!app_service_id,
    refetchOnWindowFocus: false,
  });

  return {
    isLoading,
    data,
    refetch,
  };
};

/**
 * Custom hook to fetch the active chaos agents for a given service environment.
 * Utilizes React Query to manage the data fetching and loading state.
 *
 * @param {string} app_service_id - The ID of the service environment for which to fetch the active chaos agents.
 * @returns {Object} - An object containing:
 *   - isLoading: A boolean indicating whether the data is currently being fetched.
 *   - data: The response from the server.
 *   - refetch: A function to call the query again.
 */
const useGetActiveChaosAgents = (app_service_id: string) => {
  const { getActiveChaosAgents } = useChaosExperimentsService();

  const { isLoading, refetch, data } = useQuery({
    queryKey: [QUERY_KEY.GET_ACTIVE_CHAOS_AGENTS, app_service_id],
    queryFn: () => getActiveChaosAgents(app_service_id),
    enabled: !!app_service_id,
    refetchOnWindowFocus: false,
  });

  return {
    isLoading,
    refetch,
    data,
  };
};

const useHaltExperiment = () => {
  const { haltExperiment } = useChaosExperimentsService();

  const { data, isPending, mutateAsync } = useMutation({
    mutationFn: ({
      service_env_id,
      version,
    }: {
      service_env_id: string;
      version: string;
    }) => haltExperiment(service_env_id, version),
  });

  return {
    data,
    isLoading: isPending,
    mutateAsync,
  };
};

/**
 * Custom hook to fetch the active health checks for a given application service.
 * Utilizes React Query to manage the data fetching and loading state.
 *
 * @param {string} app_service_id - The ID of the application service for which to fetch the active health checks.
 * @returns {Object} - An object containing:
 *   - isLoading: A boolean indicating whether the data is currently being fetched.
 *   - refetch: A function to call the query again.
 *   - data: The response from the server.
 */
const useGetActiveHealthChecks = (app_service_id: string) => {
  const { getActiveHealthChecks } = useChaosExperimentsService();

  const { isLoading, refetch, data } = useQuery({
    queryKey: [QUERY_KEY.GET_ACTIVE_HEALTHCHECKS, app_service_id],
    queryFn: () => getActiveHealthChecks(app_service_id),
  });

  return {
    isLoading,
    refetch,
    data,
  };
};

export {
  useGetScenarioLists,
  useGetChaosData,
  useGetChaosVersions,
  useResrunChaosScan,
  useGetConfigFile,
  useCreateExperiments,
  useGetChaosAgents,
  useGetActiveChaosAgents,
  useHaltExperiment,
  useGetActiveHealthChecks,
};
