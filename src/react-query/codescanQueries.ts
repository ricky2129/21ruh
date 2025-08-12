import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import {
  CloneRepoRequest,
  ScanStatusType,
  UpdateActionRequest,
} from "interfaces";
import { useCodescanService } from "services";

/**
 * Clone a repository to the platform
 *
 * @returns An object with the following properties:
 * - `mutateAsync`: A function to call the mutation with the given parameters
 * - `isError`: A boolean indicating whether an error occurred
 * - `error`: An error object if an error occurred
 */
function useCloneRepo() {
  const { cloneRepo } = useCodescanService();

  const { mutateAsync, isError, error, isPending } = useMutation({
    mutationFn: (obj: CloneRepoRequest) => cloneRepo(obj),
  });

  return {
    mutateAsync,
    isError,
    error,
    isLoading: isPending,
  };
}

/**
 * Fetches the codescan dashboard for a given service environment
 *
 * @param {string} service_env_id - The id of the service environment
 * @param {number} version - The version of the codescan
 * @param {boolean} isScanCompleted - A boolean indicating whether the scan is completed
 *
 * @returns An object with the following properties:
 * - `data`: The response from the server
 * - `isLoading`: A boolean indicating whether the query is in flight
 * - `isError`: A boolean indicating whether an error occurred
 * - `refetch`: A function to call the query again with the same parameters
 */
function useGetCodeScanDashboard(
  service_env_id: string,
  version: number,
  scanStatus: ScanStatusType,
) {
  const { fetchCodescanDashboard } = useCodescanService();
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [
      QUERY_KEY.FETCH_CODESCAN_DASHBOARD,
      service_env_id,
      version,
      scanStatus,
    ],
    queryFn: () => fetchCodescanDashboard(service_env_id, version),
    refetchOnWindowFocus: false,
    enabled:
      service_env_id !== null &&
      version !== null &&
      scanStatus &&
      scanStatus !== "PENDING" &&
      scanStatus !== "PROCESSED" &&
      scanStatus !== "FAILED",
    retry: true,
    gcTime: 0,

    /**
     * Refetches the data every 10 seconds if the scan is currently processed, otherwise disables refetching.
     * @returns {number|false} The number of milliseconds to wait before refetching or false to disable refetching.
     */
    refetchInterval() {
      return scanStatus && scanStatus === "RUNNING" ? 15000 : false;
    },
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
}

/**
 * Fetches the code for a given service environment and version
 *
 * @param {string} service_env_id - The id of the service environment
 * @param {number} version - The version of the code
 * @param {boolean} isScanCompleted - Whether the scan has been completed
 * @returns An object with the following properties:
 * - `data`: The response from the server
 * - `isLoading`: A boolean indicating whether the data is being fetched
 * - `isError`: A boolean indicating whether an error occurred
 * - `refetch`: A function to call the query again
 */
function useFetchCode(
  service_env_id: string,
  version: number,
  scanStatus: ScanStatusType,
) {
  const { fetchCode } = useCodescanService();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.FETCH_CODE, service_env_id, version, scanStatus],
    queryFn: () => fetchCode(service_env_id, version),
    refetchOnWindowFocus: false,
    enabled:
      service_env_id !== null &&
      version !== null &&
      scanStatus &&
      scanStatus !== "PENDING" &&
      scanStatus !== "PROCESSED" &&
      scanStatus !== "FAILED",
    gcTime: 0,

    /**
     * Refetches the data every 3 seconds if the scan has not been completed, otherwise disables refetching.
     * @returns {number|false} The number of milliseconds to wait before refetching or false to disable refetching.
     */
    refetchInterval() {
      return scanStatus && scanStatus === "RUNNING" ? 15000 : false;
    },
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
}

/**
 * Fetches the code scan for a given service environment and version
 *
 * @param {string} service_env_id - The id of the service environment
 * @param {number} version - The version of the code scan
 * @returns An object with the following properties:
 * - `isLoading`: A boolean indicating whether the data is being fetched
 * - `data`: The response from the server
 * - `refetch`: A function to call the query again
 */
function useCodeScan(service_env_id: string, version: number) {
  const { codeScan } = useCodescanService();

  const { isFetching, data, refetch } = useQuery({
    queryKey: [QUERY_KEY.CODE_SCAN, service_env_id, version],
    queryFn: () => codeScan(service_env_id, version),
    enabled: service_env_id !== null && version !== null,
    refetchOnWindowFocus: false,
    gcTime: 0,

    /**
     * Refetches the data every 10 seconds if the scan is currently processed, otherwise disables refetching.
     * @param {QueryObserverResult} query - The query object containing the data and status
     * @returns {number|false} The number of milliseconds to wait before refetching or false to disable refetching.
     */
    refetchInterval(query) {
      return query?.state?.data?.status === "PROCESSED"
        ? 10000
        : false;
    },
  });

  return {
    isLoading: isFetching,
    data,
    refetch,
  };
}

/**
 * Initiates a rescan for the given service environment
 *
 * @param {string} service_env_id - The id of the service environment
 */
function useRescan() {
  const { rescan } = useCodescanService();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (servEnv_id: string) => rescan(servEnv_id),
  });

  return {
    isLoading: isPending,
    mutateAsync,
  };
}

/**
 * Fetches the total number of versions for the given service environment
 *
 * @param {string} service_env_id - The id of the service environment
 * @returns An object with the following properties:
 * - `isLoading`: A boolean indicating whether the data is being fetched
 * - `refetch`: A function to call the query again
 * - `data`: The response from the server
 */
function useTotalVersions(service_env_id: string) {
  const { totalVersions } = useCodescanService();

  const { data, isFetching, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEY.TOTAL_VERSIONS, service_env_id],
    queryFn: () => totalVersions(service_env_id),
    refetchOnWindowFocus: false,
    enabled: service_env_id !== null,
    gcTime: 0,
  });

  return {
    isLoading: isFetching || isLoading,
    refetch,
    data,
  };
}

/**
 * Updates the action taken status for a given codescan
 *
 * @returns An object with the following properties:
 * - `mutateAsync`: A function to call the mutation
 * - `isPending`: A boolean indicating whether the mutation is in progress
 */
function useUpdateActionTaken() {
  const { updateActionTaken } = useCodescanService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (obj: UpdateActionRequest) => updateActionTaken(obj),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

/**
 * Triggers the analysis of a repository for a given service environment
 *
 * @returns An object with the following properties:
 * - `mutateAsync`: A function to call the mutation
 * - `isLoading`: A boolean indicating whether the mutation is in progress
 */
function useAnalyzeRepo() {
  const { analyzeRepo } = useCodescanService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (service_env_id: string) => analyzeRepo(service_env_id),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

export {
  useCloneRepo,
  useGetCodeScanDashboard,
  useRescan,
  useTotalVersions,
  useCodeScan,
  useFetchCode,
  useUpdateActionTaken,
  useAnalyzeRepo,
};
