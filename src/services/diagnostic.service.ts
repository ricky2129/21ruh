import { ApiUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { DiagnosticsReport } from "interfaces";
import { get, post } from "network/query";

const useDiagnosticService = () => {
  const getDiagnosticsVersionsList = async (
    service_env_id: number,
  ): Promise<string[]> => {
    const response = await get(
      resolveUrlParams(ApiUrl.GET_DIAGNOSTICS_VERSIONS_LIST, {
        service_env_id: service_env_id.toString(),
      }),
    );
    return response || [];
  };
  /**
   * Fetches the diagnostics report for a given service environment and version.
   *
   * @param {number} service_env_id - The id of the service environment
   * @param {string} [version=""] - The version of the diagnostics report to fetch
   * @returns {Promise<DiagnosticsReport>} A promise that resolves to the diagnostics report
   */
  const getDiagnosticsReport = async (
    service_env_id: number,
    version: string = "",
  ): Promise<DiagnosticsReport> => {
    const response = await post(ApiUrl.GET_DIAGNOSTICS_REPORT, {
      service_env_id,
      version,
    });

    return response || "";
  };

  /**
   * Runs diagnostics for a given service environment.
   *
   * @param {number} service_env_id - The id of the service environment
   * @returns {Promise<DiagnosticsReport>} A promise that resolves to the diagnostics report
   */
  const runDiagnostics = async (
    service_env_id: number,
  ): Promise<DiagnosticsReport> => {
    const response = await post(
      resolveUrlParams(ApiUrl.RUN_DIAGNOSTICS, {
        service_env_id: service_env_id.toString(),
      }),
      {},
    );

    return response || "";
  };

  const postResiliencyUpdateActionTaken = async (
    payloadArray: any[],
  ): Promise<any> => {
    const response = await post(
      ApiUrl.RESILENCY_UPDATE_ACTION_TOKEN, 
      payloadArray,
    );
    return response;
  };

  return {
    getDiagnosticsVersionsList,
    getDiagnosticsReport,
    runDiagnostics,
    postResiliencyUpdateActionTaken
  };
};

export default useDiagnosticService;
