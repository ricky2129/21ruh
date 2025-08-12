import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { useTeamService } from "services";

function useGetTeamList() {
  const { getTeamList } = useTeamService();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_USERS],
    enabled: true,
    queryFn: () => getTeamList(),
  });
  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * Fetches the details of a specific team.
 *
 * @param {string} id - The unique identifier of the team to fetch.
 *
 * @returns An object with the following properties:
 *   - `data`: The team details if the data is available.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isError`: A boolean indicating whether the data fetch failed.
 *   - `refetch`: A function to refetch the data.
 */
const useGetTeamDetails = (id: string) => {
  const { getTeamDetails } = useTeamService();

  const { isFetching, refetch, data, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_TEAM_DETAILS, id],
    enabled: !!id,
    queryFn: () => getTeamDetails(id),
    refetchOnWindowFocus: false
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
};

export { useGetTeamList, useGetTeamDetails };
