import { ApiUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { FETCHED_TEAM, TEAM_DETAILS } from "interfaces";

import { get } from "../network/query";

const useTeamService = () => {
  /**
   * Fetches list of users based on query
   * @params query string
   * @returns A list of projects from Dashboard API
   */
  const getTeamList = async (): Promise<FETCHED_TEAM[]> => {
    const response = await get(ApiUrl.GET_TEAM_LIST);

    return response || [];
  };

/**
 * Fetches detailed information about a specific team.
 *
 * @param {string} id - The unique identifier of the team to fetch details for.
 * @returns {Promise<TEAM_DETAILS[]>} A promise that resolves to an array of team details.
 */
  const getTeamDetails = async (id: string): Promise<TEAM_DETAILS> => {
    const res = await get(resolveUrlParams(ApiUrl.GET_TEAM_DETAILS, { id }));

    return res || ""
  };

  return {
    getTeamList,
    getTeamDetails,
  };
};

export default useTeamService;
