import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import {
  AWSSignInRequest,
  GremlinSignInRequest,
  RepositorySignInRequest,
  UpdateIntegrationRequest,
} from "interfaces";
import { useIntegrationService } from "services";

/**
 * Creates an AWS secret.
 *
 * @returns An object with a single method `mutateAsync` to call the mutation.
 *   - `mutateAsync`: A function to call the mutation.
 */

function useCreateAWSSecret() {
  const { createAwsSecret } = useIntegrationService();

  const { mutateAsync } = useMutation({
    mutationFn: (obj: AWSSignInRequest) => createAwsSecret(obj),
  });

  return {
    mutateAsync,
  };
}

/**
 * Creates a Github secret.
 *
 * @returns An object with a single method `mutateAsync` to call the mutation.
 *   - `mutateAsync`: A function to call the mutation.
 */
function useCreateGithubSecret() {
  const { createGithubSecret } = useIntegrationService();

  const { mutateAsync } = useMutation({
    mutationFn: (obj: RepositorySignInRequest) => createGithubSecret(obj),
  });

  return {
    mutateAsync,
  };
}

/**
 * Fetches a list of AWS secrets for a given project id.
 *
 * @param {string} project_id The project id to fetch the AWS secrets for.
 *
 * @returns An object with the following properties:
 *   - `refetch`: A function to refetch the data.
 *   - `data`: The list of AWS secrets.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isError`: A boolean indicating whether the data fetch failed.
 */
function useGetAWSIntegrationsByProjectId(project_id: string) {
  const { getSecretKeysByProjectId } = useIntegrationService();

  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_AWS_INTEGRATIONS_BY_PROJECTID, project_id],
    queryFn: () => getSecretKeysByProjectId(1, project_id),
    enabled: true,
    refetchOnWindowFocus: false,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

/**
 * Fetches a list of AWS secrets for a given application id.
 *
 * @param {string} application_id The application id to fetch the AWS secrets for.
 *
 * @returns An object with the following properties:
 *   - `refetch`: A function to refetch the data.
 *   - `data`: The list of AWS secrets.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isError`: A boolean indicating whether the data fetch failed.
 */
function useGetAWSIntegrationsByApplicationId(application_id: string) {
  const { getSecretKeysByApplicationId } = useIntegrationService();

  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_AWS_INTEGRATIONS_BY_APPLICATIONID, application_id],
    queryFn: () => getSecretKeysByApplicationId(1, application_id),
    enabled: !!application_id && application_id !== 'undefined',
    refetchOnWindowFocus: false,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

/**
 * Fetches a list of Gremlin secrets for a given project id.
 *
 * @param {string} project_id The project id to fetch the Gremlin secrets for.
 *
 * @returns An object with the following properties:
 *   - `refetch`: A function to refetch the data.
 *   - `data`: The list of Gremlin secrets.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isError`: A boolean indicating whether the data fetch failed.
 */

function useGetGremlinIntegrationsByProjectId(project_id: string) {
  const { getSecretKeysByProjectId } = useIntegrationService();

  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_GREMLIN_INTEGRATIONS_BY_PROJECTID, project_id],
    queryFn: () => getSecretKeysByProjectId(3, project_id),
    enabled: true,
    refetchOnWindowFocus: false,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

/**
 * Fetches a list of Gremlin secrets for a given application id.
 *
 * @param {string} application_id The application id to fetch the Gremlin secrets for.
 *
 * @returns An object with the following properties:
 *   - `refetch`: A function to refetch the data.
 *   - `data`: The list of Gremlin secrets.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isError`: A boolean indicating whether the data fetch failed.
 */
function useGetGremlinIntegrationsByApplicationId(application_id: string) {
  const { getSecretKeysByApplicationId } = useIntegrationService();

  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_GREMLIN_INTEGRATIONS_BY_PROJECTID, application_id],
    queryFn: () => getSecretKeysByApplicationId(3, application_id),
    enabled: !!application_id && application_id !== 'undefined',
    refetchOnWindowFocus: false,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

/**
 * Fetches a list of Github secrets for a given project id.
 *
 * @param {string} project_id The project id to fetch the Github secrets for.
 *
 * @returns An object with the following properties:
 *   - `refetch`: A function to refetch the data.
 *   - `data`: The list of Github secrets.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isError`: A boolean indicating whether the data fetch failed.
 */
function useGetGithubIntegrationsByProjectId(project_id: string) {
  const { getSecretKeysByProjectId } = useIntegrationService();

  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_GITHUB_INTEGRATIONS_BY_PROJECTID, project_id],
    queryFn: () => getSecretKeysByProjectId(2, project_id),
    enabled: true,
    refetchOnWindowFocus: false,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

/**
 * Fetches a list of Github secrets for a given application id.
 *
 * @param {string} application_id The application id to fetch the Github secrets for.
 *
 * @returns An object with the following properties:
 *   - `refetch`: A function to refetch the data.
 *   - `data`: The list of Github secrets.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isError`: A boolean indicating whether the data fetch failed.
 */
function useGetGithubIntegrationsByApplicationId(application_id: string) {
  const { getSecretKeysByApplicationId } = useIntegrationService();

  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [
      QUERY_KEY.GET_GITHUB_INTEGRATIONS_BY_APPLICATIONID,
      application_id,
    ],
    queryFn: () => getSecretKeysByApplicationId(2, application_id),
    enabled: !!application_id && application_id !== 'undefined',
    refetchOnWindowFocus: false,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

/**
 * Updates an existing integration.
 *
 * @returns An object with a single method `mutateAsync` to call the mutation.
 *   - `mutateAsync`: A function to call the mutation.
 */
function useUpdateIntegration() {
  const { updateIntegration } = useIntegrationService();

  const { mutateAsync } = useMutation({
    mutationFn: (obj: UpdateIntegrationRequest) => updateIntegration(obj),
  });

  return {
    mutateAsync,
  };
}

/**
 * Creates a Gremlin secret.
 *
 * @returns An object with a single method `mutateAsync` to call the mutation.
 *   - `mutateAsync`: A function to call the mutation.
 */
function useCreateGremlinSecret() {
  const { createGremlinSecret } = useIntegrationService();

  const { mutateAsync } = useMutation({
    mutationFn: (obj: GremlinSignInRequest) => createGremlinSecret(obj),
  });

  return {
    mutateAsync,
  };
}

function useGetSecretValues() {
  const { getSecretValues } = useIntegrationService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (integration_id: string) => getSecretValues(integration_id),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

export {
  useGetAWSIntegrationsByProjectId,
  useGetAWSIntegrationsByApplicationId,
  useGetGithubIntegrationsByProjectId,
  useGetGithubIntegrationsByApplicationId,
  useCreateAWSSecret,
  useCreateGithubSecret,
  useCreateGremlinSecret,
  useUpdateIntegration,
  useGetGremlinIntegrationsByProjectId,
  useGetGremlinIntegrationsByApplicationId,
  useGetSecretValues,
};
