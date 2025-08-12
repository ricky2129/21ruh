import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { CreateEnvironmentRequest, CreateInfraScheduleRequest, CreateResiliencyPolicyRequest, CreateResourceGroupRequest, ListResourceGroupRequest } from "interfaces";
import useInfraService from "services/infra.service";


function useGetInfraResources() {
  const { getResources } = useInfraService();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_INFRA_RESOURCES],
    enabled: false,
    queryFn: getResources,
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
}

function useGetInfraResourceList() {
  const { getResourceList } = useInfraService();

  const { data, isPending, isError, mutateAsync, reset } = useMutation({
    mutationFn: ({
      integration_id,
      resource,
    }: {
      integration_id: number;
      resource: string;
    }) => getResourceList(integration_id, resource),
  });

  return {
    data,
    isLoading: isPending,
    isError,
    mutateAsync,
    reset,
  };
}

function useCreateResiliencyPolicy() {
  const { createResiliencyPolicy } = useInfraService();

  const { data, isPending, isError, mutateAsync, reset } = useMutation({
    mutationFn: (data: CreateResiliencyPolicyRequest) =>
      createResiliencyPolicy(data),
  });

  return {
    data,
    isLoading: isPending,
    isError,
    mutateAsync,
    reset,
  };
}

function useGetResilienyPolicyList(integration_id: number) {
  const { getResiliencyPolicyList } = useInfraService();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_RESILIENCY_POLICY_LIST, integration_id],
    enabled: false,
    queryFn: () => getResiliencyPolicyList(integration_id),
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
}

function useCreateEnvironment() {
  const { createEnvironment } = useInfraService();

  const { data, isPending, isError, mutateAsync, reset } = useMutation({
    mutationFn: (data: CreateEnvironmentRequest) => createEnvironment(data),
  });

  return {
    data,
    isLoading: isPending,
    isError,
    mutateAsync,
    reset,
  };
}

function useCreateInfraSchedule() {
  const { createInfraSchedule } = useInfraService();

  const { data, isPending, isError, mutateAsync, reset } = useMutation({
    mutationFn: (data: CreateInfraScheduleRequest) => createInfraSchedule(data),
  });

  return {
    data,
    isLoading: isPending,
    isError,
    mutateAsync,
    reset,
  };
}

function useCreateResourceGroup() {
  const { createResourceGroup } = useInfraService();

  const { data, isPending, mutateAsync } = useMutation({
    mutationFn: (req: CreateResourceGroupRequest) => createResourceGroup(req),
  });

  return {
    data,
    isPending,
    mutateAsync,
  };
}

/**
 * Fetches list of resource groups based on the given integration id and tags.
 *
 * @param {ListResourceGroupRequest} req The request object containing the integration id and tags.
 * @returns {data: string, isFetching: boolean, refetch: () => Promise<void>} An object containing the list of resource groups, a boolean indicating if the data is fetching, and a function to refetch the data.
 */
function useGetListResourceGroup(req: ListResourceGroupRequest) {
  const { listResourceGroup } = useInfraService();

  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: [
      QUERY_KEY.GET_LIST_RESOURCE_GROUP,
      req?.integration_id,
      req?.tags,
    ],
    enabled: req?.integration_id !== null && req?.tags && req?.tags?.length > 0 ? true : false,
    refetchOnWindowFocus: false,
    queryFn: ({ signal }) => listResourceGroup(req, signal),
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}

export {
  useGetInfraResources,
  useGetInfraResourceList,
  useCreateResiliencyPolicy,
  useGetResilienyPolicyList,
  useCreateEnvironment,
  useCreateInfraSchedule,
  useCreateResourceGroup,
  useGetListResourceGroup
};