import { ApiUrl } from "constant";
import { FETCHED_USER, PROFILE, ROLE } from "interfaces";



import { get } from "../network/query";


const useUserService = () => {
  /**
   * Fetches list of users based on query
   * @params query string
   * @returns A list of projects from Dashboard API
   */
  const searchUser = async (query: string, signal): Promise<FETCHED_USER[]> => {
    const response = await get(ApiUrl.SEARCH_USER + `/${query}`, {}, {}, signal);

    return response || [];
  };

  const getUserRoles = async (): Promise<ROLE[]> => {
    const response = await get(ApiUrl.GET_USER_ROLES)

    return response || []
  }

  /**
   * Fetches the profile of the currently logged in user.
   * @returns The profile of the user, with their name, email, and other details.
   */
  const getUserProfile = async (): Promise<PROFILE> => {
    const res = await get(ApiUrl.GET_USER_PROFILE);

    return res || []
  }

  return {
    searchUser,
    getUserRoles,
    getUserProfile
  };
};

export default useUserService;