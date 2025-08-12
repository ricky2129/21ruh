import { ApiUrl } from "constant";
import { resolveUrlParams } from "helpers";
import {
  AppDashboardRecommendTableResponse,
  AppDetailsResponse,
  AppReliabilityPostureResponse,
  AppReliabilityScoreResponse,
  PortfolioDetailsResponse,
  PortfolioGraphResponse,
  PortfolioRecommendationResponse,
} from "interfaces";
import { get } from "network/query";

const useDashboardService = () => {
  const getAppDashboardDetails = async (
    app_service_id: string,
  ): Promise<AppDetailsResponse> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_APP_DASHBOARD_DETAILS, {
        app_service_id,
      }),
    );

    return res || "";
  };

  const getRecommendationTableDetails = async (
    app_service_id: string,
  ): Promise<AppDashboardRecommendTableResponse[]> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_APP_DASHBOARD_RECOMMENDATION_TABLE_DETAILS, {
        app_service_id,
      }),
    );

    return res || "";
  };

  const getAppReliabilityScore = async (
    app_id: number,
  ): Promise<AppReliabilityScoreResponse[]> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_APP_RELIABILITY_SCORE, {
        app_id: app_id.toString(),
      }),
    );

    return res || "";
  };

  const getAppReliabilityPosture = async (
    app_id: number,
  ): Promise<AppReliabilityPostureResponse[]> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_APP_RELIABILITY_POSTURE, {
        app_id: app_id.toString(),
      }),
    );

    return res || "";
  };

  const getPortfolioGraphData = async (
    project_id: number,
  ): Promise<PortfolioGraphResponse[]> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_PORTFOLIO_GRAPH_DATA, {
        project_id: project_id.toString(),
      }),
    );

    return res || "";
  };

  const getPortfolioDetails = async (
    project_id: number,
  ): Promise<PortfolioDetailsResponse> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_PORTFOLIO_DETAILS, {
        project_id: project_id.toString(),
      }),
    );

    return res || "";
  };

  const getPortfolioRecommendation = async (
    project_id: number,
  ): Promise<PortfolioRecommendationResponse[]> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_PORTFOLIO_RECOMMENDATION_TABLE, {
        project_id: project_id.toString(),
      }),
    );

    return res || "";
  };

  return {
    getAppDashboardDetails,
    getRecommendationTableDetails,
    getAppReliabilityScore,
    getAppReliabilityPosture,
    getPortfolioGraphData,
    getPortfolioDetails,
    getPortfolioRecommendation,
  };
};

export default useDashboardService;
