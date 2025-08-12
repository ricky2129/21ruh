import { ApiUrl } from "constant";
import { resolveUrlParams } from "helpers";
import {
  AgentsResponse,
  ChaosDataResponse,
  ChaosVersionResponse,
  CreateExperimentRequest,
  HealthCheckResponse,
} from "interfaces";
import { get, post } from "network/query";

const useChaosExperimentsService = () => {
  /**
   * Fetches a list of scenario names for chaos experiments.
   *
   * @returns A promise that resolves to an array of scenario names as strings.
   */
  const getScenarioLists = async (): Promise<string[]> => {
    const res = await get(ApiUrl.GET_SCENARIO_LISTS);

    return res || [];
  };

  /**
   * Fetches the chaos experiment data for a given service environment and version.
   *
   * @param {string} service_env_id - The id of the service environment
   * @param {string} version - The version of the chaos experiment data to fetch
   * @returns A promise that resolves to the chaos experiment data as a string
   */
  const getChaosData = async (
    service_env_id: string,
    version: string,
  ): Promise<ChaosDataResponse> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_CHAOS_DATA, { service_env_id, version }),
    );

    return res || "";
  };

  /**
   * Fetches the versions for a given service environment
   *
   * @param {string} service_env_id - The id of the service environment
   * @returns A promise that resolves to an array of numbers representing the versions of the chaos experiment data
   */
  const getVersions = async (
    service_env_id: string,
  ): Promise<ChaosVersionResponse> => {
    const res = await get(ApiUrl.GET_CHAOS_VERSIONS, { service_env_id });

    return res || "";
  };

  /**
   * Initiates a rerun of the chaos experiments scan for a given service environment.
   *
   * @param {string} service_env_id - The id of the service environment
   * @returns {Promise<string>} A promise that resolves to the response from the server
   */
  const rerunChaosScan = async (service_env_id: string): Promise<string> => {
    const res = await get(
      resolveUrlParams(ApiUrl.RERUN_CHOAS_SCAN, {
        service_env_id,
      }),
    );

    return res || "";
  };

  const downloadConfigFile = async (app_service_id: string): Promise<Blob> => {
    const res = await get(
      resolveUrlParams(ApiUrl.DOWNLOAD_CONFIG_FILE, {
        app_service_id,
      }),
      {},
      {},
      null,
      "blob",
    );

    return res || "";
  };

  /**
   * Creates a new chaos experiment.
   *
   * @param {CreateExperimentRequest} obj - The request object containing the details of the experiment to be created.
   * @returns {Promise<string>} A promise that resolves to the response from the server.
   */
  const createExperiment = async (obj: CreateExperimentRequest) => {
    const res = await post(ApiUrl.CREATE_EXPERIMENT, obj);

    return res || "";
  };

  /**
   * Fetches the list of chaos agents for a given application service.
   *
   * @param {string} app_service_id - The id of the application service
   * @returns {Promise<AgentsResponse[]>} A promise that resolves to the response from the server
   */
  const getChaosAgents = async (
    app_service_id: string,
  ): Promise<AgentsResponse[]> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_CHAOS_AGENTS, {
        app_service_id,
      }),
    );

    return res || "";
  };

  /**
   * Fetches the list of active chaos agents for a given application service.
   *
   * @param {string} app_service_id - The id of the application service
   * @returns {Promise<AgentsResponse[]>} A promise that resolves to the response from the server
   */
  const getActiveChaosAgents = async (
    app_service_id: string,
  ): Promise<AgentsResponse[]> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_ACTIVE_AGENTS, {
        app_service_id,
      }),
    );

    return res || "";
  };

  const haltExperiment = async (
    service_env_id: string,
    version: string,
  ): Promise<string> => {
    const res = await get(ApiUrl.HALT_EXPERIMENT, { service_env_id, version });

    return res || "";
  };

  const getActiveHealthChecks = async (
    app_service_id: string,
  ): Promise<HealthCheckResponse[]> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_ACTIVE_HEALTHCHECKS, {
        app_service_id,
      }),
    );

    return res || "";
  };

  return {
    getScenarioLists,
    getChaosData,
    getVersions,
    rerunChaosScan,
    downloadConfigFile,
    createExperiment,
    getChaosAgents,
    getActiveChaosAgents,
    haltExperiment,
    getActiveHealthChecks,
  };
};

export default useChaosExperimentsService;
