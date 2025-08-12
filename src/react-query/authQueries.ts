import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { LoginMFARequest, LoginRequest, SignupRequest } from "interfaces";
import { useAuthService } from "services";

const useSignup = () => {
  const { signup } = useAuthService();
  const { isError, isPending, isSuccess, mutateAsync, reset } = useMutation({
    mutationFn: (signupRequest: SignupRequest) => signup(signupRequest),
  });

  return {
    isLoading: isPending,
    isError,
    isSuccess,
    mutateAsync,
    reset,
  };
};

const useLogin = () => {
  const { login } = useAuthService();
  const { isError, isPending, isSuccess, mutateAsync, reset } = useMutation({
    mutationFn: ({ email, password }: LoginRequest) => login(email, password),
  });

  return {
    isLoading: isPending,
    isError,
    isSuccess,
    mutateAsync,
    reset,
  };
};

const useLoginMfa = () => {
  const { loginMfa } = useAuthService();
  const { isPending, mutateAsync, reset, isError } = useMutation({
    mutationFn: (request: LoginMFARequest) => loginMfa(request),
  });

  return {
    isLoading: isPending,
    mutateAsync,
    reset,
    isError,
  };
};

const useRefresh = () => {
  const { refresh } = useAuthService();

  const { data, refetch, isError } = useQuery({
    queryKey: [QUERY_KEY.REFRESH],
    queryFn: refresh,
    refetchOnWindowFocus: false,
    enabled: false,
    retry: false,
  });
  return {
    data,
    refetch,
    isError,
  };
};

const useGenerateMfa = () => {
  const { generateMfa } = useAuthService();

  const { mutateAsync, reset, isError, data } = useMutation({
    mutationFn: (email: string) => generateMfa(email),
  });

  return {
    mutateAsync,
    reset,
    isError,
    data,
  };
};

const useLogout = () => {
  const { logout } = useAuthService();

  const { data, refetch, isError } = useQuery({
    queryKey: [QUERY_KEY.LOGOUT],
    enabled: false,
    queryFn: logout,
  });
  return {
    data,
    refetch,
    isError,
  };
};

export {
  useSignup,
  useLogin,
  useRefresh,
  useGenerateMfa,
  useLogout,
  useLoginMfa,
};
