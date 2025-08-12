import { ApiUrl } from "constant";
import {
  LoginMFARequest,
  LoginMFAResponse,
  LoginResponse,
  RefreshResponse,
  SignupRequest,
} from "interfaces";
import { get, post } from "network/query";

const useAuthService = () => {
  const signup = async (signupRequest: SignupRequest): Promise<string> => {
    const response = post(ApiUrl.SIGNUP, signupRequest);

    return response || [];
  };

  const login = async (email, password): Promise<LoginResponse> => {
    const response = post(ApiUrl.LOGIN, { email, password });

    return response || [];
  };

  const loginMfa = async (
    request: LoginMFARequest,
  ): Promise<LoginMFAResponse> => {
    const response = post(ApiUrl.LOGIN_MFA, request);

    return response || [];
  };

  const refresh = async (): Promise<RefreshResponse> => {
    const response = get(
      ApiUrl.REFRESH,
      {},
      { Authorization: `Bearer ${localStorage.getItem("refresh_token")}` },
    );

    return response || [];
  };

  const generateMfa = async (email: string): Promise<Blob> => {
    const response = post(ApiUrl.GENERATE_MFA, { email }, "blob");

    return response || [];
  };

  const logout = async (): Promise<Response> => {
    const response = await get(ApiUrl.LOGOUT);

    return response;
  };

  return {
    signup,
    login,
    loginMfa,
    refresh,
    generateMfa,
    logout,
  };
};

export default useAuthService;
