import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { useDashboardService } from "services";

function useGetDashboardDetails(app_id: string) {
  const { getAppDashboardDetails } = useDashboardService();
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.FETCH_DASHBOARD, app_id],
    queryFn: () => getAppDashboardDetails(app_id),
    refetchOnWindowFocus: false,
    enabled: !!app_id,
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
}

function useGetAppDashboardRecommendationDetails(app_id: string) {
  const { getRecommendationTableDetails } = useDashboardService();
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.FETCH_APP_DASHBOARD_RECOMMENDATION_DTLS_TABLE, app_id],
    queryFn: () => getRecommendationTableDetails(app_id),
    refetchOnWindowFocus: false,
    enabled: !!app_id,
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
}

function useGetAppReliabilityScore(app_id: number) {
  const { getAppReliabilityScore } = useDashboardService();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.FETCH_APP_RELIABILITY_SCORE, app_id],
    queryFn: () => getAppReliabilityScore(app_id),
    refetchOnWindowFocus: false,
    enabled: !!app_id,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}

function useGetAppReliabilityPosture(app_id: number) {
  const { getAppReliabilityPosture } = useDashboardService();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.FETCH_APP_RELIABILITY_POSTURE, app_id],
    queryFn: () => getAppReliabilityPosture(app_id),
    refetchOnWindowFocus: false,
    enabled: !!app_id,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}

function useGetPortfolioGraphData(project_id: number) {
  const { getPortfolioGraphData } = useDashboardService();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_PORTFOLIO_GRAPH_DATA, project_id],
    queryFn: () => getPortfolioGraphData(project_id),
    refetchOnWindowFocus: false,
    enabled: !!project_id,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}

function useGetPortfolioDetails(project_id: number) {
  const { getPortfolioDetails } = useDashboardService();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_PORTFOLIO_DETAILS, project_id],
    queryFn: () => getPortfolioDetails(project_id),
    refetchOnWindowFocus: false,
    enabled: !!project_id,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}

function useGetPortfolioRecommendation(project_id: number) {
  const { getPortfolioRecommendation } = useDashboardService();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_PORTFOLIO_RECOMMENDATION, project_id],
    queryFn: () => getPortfolioRecommendation(project_id),
    refetchOnWindowFocus: false,
    enabled: !!project_id,
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}

export {
  useGetDashboardDetails,
  useGetAppDashboardRecommendationDetails,
  useGetAppReliabilityScore,
  useGetAppReliabilityPosture,
  useGetPortfolioGraphData,
  useGetPortfolioDetails,
  useGetPortfolioRecommendation,
};
