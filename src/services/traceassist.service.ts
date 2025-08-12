import { TraceAssistUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { get, post } from "../network/query";

import {
  CreateDeploymentRequest,
  DeploymentResponse,
  InstrumentResponse,
  Deployment,
  GrafanaDashboardRequest,
  GrafanaDashboardResponse,
} from "../interfaces/traceAssist";

const useTraceAssistService = () => {

  const createDeployment = async (
    req: CreateDeploymentRequest
  ): Promise<DeploymentResponse> => {
    const response = await post(TraceAssistUrl.CREATE_DEPLOYMENT, req);
    return response || {};
  };

  const getDeploymentDetails = async (
    deploymentName: string
  ): Promise<DeploymentResponse> => {
    const url = resolveUrlParams(TraceAssistUrl.GET_DEPLOYMENT_DETAILS, { deployment_name: deploymentName });
    const response = await get(url);
    return response || {};
  };

  const instrumentDeployment = async (
    params: { deploymentName: string; pat_token: string }
  ): Promise<InstrumentResponse> => {
    const { deploymentName, pat_token } = params;
    const url = resolveUrlParams(TraceAssistUrl.INSTRUMENT_DEPLOYMENT, { deployment_name: deploymentName });
    const response = await post(url, { pat_token });
    return response || {};
  };

  const getAllDeployments = async (): Promise<Deployment[]> => {
    const response = await get(TraceAssistUrl.GET_ALL_DEPLOYMENTS);
    return response || [];
  };

  return {
    createDeployment,
    getDeploymentDetails,
    instrumentDeployment,
    getAllDeployments,
  };
};

export default useTraceAssistService;
