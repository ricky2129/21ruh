import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { useUserService } from "services";

function useSearchUsers(query: string) {
  const { searchUser } = useUserService();

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_USERS, query],
    enabled: !!query,
    queryFn: ({ signal }) => searchUser(query, signal),
  });
  return {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  };
}

function useUserRoles() {
  const { getUserRoles } = useUserService();

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_USER_ROLES],
    queryFn: getUserRoles,
  });
  return {
    data,
    isLoading,
    isError,
  };
}

/**
 * Fetches the profile of the currently logged in user.
 *
 * @returns An object with a single property `data` that contains the profile of the user, with their name, email, and other details.
 *   - `data`: The profile of the user, with their name, email, and other details.
 *   - `isLoading`: A boolean indicating whether the data is currently being fetched.
 *   - `isError`: A boolean indicating whether there was an error fetching the data.
 */
function useGetUserProfile() {
  const { getUserProfile } = useUserService();

  const { data, isFetching, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_USER_PROFILE],
    queryFn: getUserProfile,
    refetchOnWindowFocus: false
  });

  return {
    data,
    isLoading: isFetching,
    isError,
  };
}

export { useSearchUsers, useUserRoles, useGetUserProfile };
