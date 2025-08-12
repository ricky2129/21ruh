import { ApiUrl } from "constant";
import { resolveUrlParams } from "helpers";
import {
  CloneRepoRequest,
  CodeScansResponse,
  FetchCodeScanDashboardResponse,
  FetchCodeScanResponse,
  TotalVersionsResponse,
  UpdateActionRequest,
} from "interfaces";
import { get, post } from "network/query";


/**
 * Service for codescan operations
 *
 * This service provides functions for cloning a repository, fetching the codescan dashboard,
 * fetching code, rescanning, fetching the total number of versions, fetching code scan data,
 * updating the action taken status and triggering the analysis of a repository.
 *
 * @returns {Object} An object with the following properties:
 * - `cloneRepo`: A function to clone a repository to the platform
 * - `fetchCodescanDashboard`: A function to fetch the codescan dashboard for a given service environment
 * - `fetchCode`: A function to fetch the code for a given service environment
 * - `rescan`: A function to rescan the given service environment
 * - `totalVersions`: A function to fetch the total number of versions for a given service environment
 * - `codeScan`: A function to fetch the code scan data for a given service environment and version
 * - `updateActionTaken`: A function to update the action taken status for a given codescan
 * - `analyzeRepo`: A function to trigger the analysis of a repository for a given service environment
 * @example
 * const { cloneRepo, fetchCodescanDashboard } = useCodescanService();
 *
 * cloneRepo({
 *   app_service_id: 1,
 *   repo_url: "https://github.com/some/repo",
 *   branch: "main",
 *   github_integration_id: 1,
 *   aws_integration_id: 1,
 * });
 *
 * const response = await fetchCodescanDashboard(1, 1);
 */
const useCodescanService = () => {
  /**
   * Clone a repository to the platform
   *
   * @param {CloneRepoRequest} obj - The object containing the repository details
   * @returns {Promise<string>} The response from the server
   */
  const cloneRepo = async (obj: CloneRepoRequest): Promise<string> => {
    const response = await post(ApiUrl.CLONE_REPO, obj);

    return response || "";
  };

  /**
   * Fetches the codescan dashboard for a given service environment
   *
   * @param {number} service_env_id - The id of the service environment
   * @returns {Promise<FetchCodeScanResponse>} The response from the server
   */
  const fetchCodescanDashboard = async (
    service_env_id: string,
    version: number,
  ): Promise<FetchCodeScanDashboardResponse> => {
    const response = await get(
      resolveUrlParams(ApiUrl.FETCH_CODESCAN_DASHBOARD, {
        service_env_id: service_env_id.toString(),
        version: version.toString(),
      }),
    );

    return response || "";
  };

  /**
   * Fetches the code for a given service environment
   *
   * @param {number} service_env_id - The id of the service environment
   * @returns {Promise<FetchCodeScanResponse>} The response from the server
   */
  const fetchCode = async (
    service_env_id: string,
    version: number,
  ): Promise<FetchCodeScanResponse[]> => {
    const response = await get(
      resolveUrlParams(ApiUrl.FETCH_CODE, {
        service_env_id,
        version: version.toString(),
      }),
    );

    return response || "";
  };

  /**
   * Fetches the code scan for a given service environment and version
   *
   * @param {string} service_env_id - The id of the service environment
   * @param {string} version - The version of the code scan
   * @returns {Promise<CodeScansResponse>} The response from the server
   */
  const codeScan = async (
    service_env_id: string,
    version: number,
  ): Promise<CodeScansResponse> => {
    const response = await get(
      resolveUrlParams(ApiUrl.CODE_SCANS, {
        service_env_id,
        version: version.toString(),
      }),
    );

    return response || "";
  };

  /**
   * Rescans the given service environment
   *
   * @param {string} service_env_id - The id of the service environment
   * @returns {Promise<string>} The response from the server
   */
  const rescan = async (servEnv_id: string): Promise<string> => {
    const response = await post(
      ApiUrl.RESCAN,
      {},
      "json",
      {},
      {
        servEnv_id,
      },
    );

    return response || "";
  };

  /**
   * Fetches the total number of versions for a given service environment
   *
   * @param {string} service_env_id - The id of the service environment
   * @returns {Promise<TotalVersionsResponse>} The response from the server
   */
  const totalVersions = async (
    service_env_id: string,
  ): Promise<TotalVersionsResponse> => {
    const response = await get(
      resolveUrlParams(ApiUrl.TOTAL_VERSIONS, {
        service_env_id,
      }),
    );

    return response || "";
  };

  /**
   * Updates the action taken status for a given codescan
   *
   * @param {UpdateActionRequest} obj - The object containing the codescan id and action taken status
   * @returns {Promise<string>} The response from the server
   */
  const updateActionTaken = async (
    obj: UpdateActionRequest,
  ): Promise<string> => {
    const response = await post(ApiUrl.UPDATE_ACTION_TAKEN, [obj]);

    return response || "";
  };

  /**
   * Triggers the analysis of a repository for a given service environment
   *
   * @param {string} service_env_id - The id of the service environment
   * @returns {Promise<string>} The response from the server
   */
  const analyzeRepo = async (service_env_id: string): Promise<string> => {
    const response = await post(
      resolveUrlParams(ApiUrl.ANALYZE_REPO, { service_env_id }),
      {},
    );

    return response || "";
  };

  return {
    cloneRepo,
    fetchCodescanDashboard,
    fetchCode,
    rescan,
    totalVersions,
    codeScan,
    updateActionTaken,
    analyzeRepo,
  };
};

export default useCodescanService;
