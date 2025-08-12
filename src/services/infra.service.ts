import { GenericAbortSignal } from "axios";
import { ApiUrl } from "constant";
import {
  CreateEnvironmentRequest,
  CreateEnvironmentResponse,
  CreateInfraScheduleRequest,
  CreateResiliencyPolicyRequest,
  CreateResiliencyPolicyResponse,
  CreateResourceGroupRequest,
  InfraResource,
  InfraResources,
  ListResourceGroupRequest,
  ListResourceGroupResponse,
} from "interfaces";
import { get, post } from "network/query";

const useInfraService = () => {
  /**
   * Fetches list of infra resources
   * @returns A list of infra resources
   */
  const getResources = async (): Promise<InfraResources> => {
    const response = await get(ApiUrl.GET_INFRA_RESOURCES);

    return response || [];
  };

  const getResourceList = async (
    integration_id: number,
    resource: string,
  ): Promise<InfraResource[]> => {
    const response = await post(ApiUrl.GET_INFRA_RESOURCE_LIST, {
      integration_id,
      res: resource,
    });

    return response || [];
  };

  const getResiliencyPolicyList = async (
    integration_id: number,
  ): Promise<CreateResiliencyPolicyResponse[]> => {
    const response = await get(
      `${ApiUrl.GET_RESILIENCY_POLICY_LIST}/${integration_id}`,
    );

    return response.resiliencyPolicies || [];
  };

  const createResiliencyPolicy = async (
    data: CreateResiliencyPolicyRequest,
  ): Promise<CreateResiliencyPolicyResponse> => {
    const response = await post(ApiUrl.CREATE_RESILIENCY_POLICY, data);

    return response.policy || {};
  };

  const createEnvironment = async (
    data: CreateEnvironmentRequest,
  ): Promise<CreateEnvironmentResponse> => {
    const response = await post(ApiUrl.CREATE_ENVIRONMENT, data);

    return response || {};
  };

  const createInfraSchedule = async (data: CreateInfraScheduleRequest) => {
    const response = await post(ApiUrl.CREATE_INFRA_SCHEDULE, data);

    return response || {};
  };

  const createResourceGroup = async (data: CreateResourceGroupRequest) => {
    const response = await post(ApiUrl.CREATE_RESOURCE_GROUP, data);

    return response || [];
  };

  const listResourceGroup = async (
    req: ListResourceGroupRequest,
    signal: GenericAbortSignal,
  ): Promise<ListResourceGroupResponse[]> => {
    const response = await post(
      ApiUrl.LIST_RESOURCE_GROUP,
      req,
      "json",
      {},
      {},
      signal,
    );

    return response || "";
  };

  return {
    createResiliencyPolicy,
    getResiliencyPolicyList,
    getResourceList,
    getResources,
    createEnvironment,
    createInfraSchedule,
    createResourceGroup,
    listResourceGroup,
  };
};

export default useInfraService;
