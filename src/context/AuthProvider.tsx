import React, { createContext, useCallback, useContext, useState } from "react";
import { useLogin, useRefresh } from "react-query";
import { useLoginMfa, useLogout } from "react-query/authQueries";
import { useNavigate } from "react-router-dom";

import { RouteUrl } from "constant";
import { LoginRequest, LoginResponse, SignupFormFieldType } from "interfaces";

interface ContextState {
  children: React.ReactNode;
}

interface IAuthContext {
  isAuthenticated: boolean;
  login: (LoginRequestType) => void;
  logout: () => void;
  track: (arg0?: boolean) => void;
  reset: () => void;
  verifyMFA: (string) => void;
  errorMessage: string;
  isError: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  isLoggedOut: boolean;
}

const initialValue = {
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  track: () => {},
  reset: () => {},
  verifyMFA: () => {},
  errorMessage: "",
  data: {} as LoginResponse,
  signupFields: {} as SignupFormFieldType,
  isLoading: true,
  isError: false,
  isLoggedIn: false,
  isLoggedOut: false,
};

const AuthContext = createContext<IAuthContext>(initialValue);

/**
 * AuthProvider provides an authentication context for the application
 * @param children The children components of the AuthProvider
 * @returns A context provider that wraps the children components
 * The context provides the following properties:
 * - isAuthenticated: boolean indicating if the user is authenticated
 * - login: function to call the login API
 * - logout: function to log out the user
 * - track: function to call the refresh API to keep the user logged in
 * - errorMessage: string containing the error message if authentication fails
 * - isError: boolean indicating if there is an error in the authentication
 * - isLoading: boolean indicating if the authentication is in progress
 */
const AuthProvider = ({ children }: ContextState) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isError, setIsError] = useState(false);

  const [loginKey, setLoginKey] = useState("");
  const navigate = useNavigate();

  const loginQuery = useLogin();
  const refreshQuery = useRefresh();
  const logoutQuery = useLogout();
  const loginMfaQuery = useLoginMfa();

  /**
   * Reset Context
   */
  const reset = useCallback(() => {
    setErrorMessage("");
    setIsLoggedIn(false);
    setIsLoggedOut(false);
    loginQuery.reset();
    setIsError(false);
  }, [loginQuery]);

  /**
   * Calls login API to authenticate the user
   *
   * @param loginData Login credentials of the user
   * @returns void
   */
  const login = useCallback(
    async (loginData: LoginRequest) => {
      try {
        setIsLoading(true);

        const response = await loginQuery.mutateAsync(loginData);

        setLoginKey(response.key);
        setIsLoggedIn(true);
        navigate(RouteUrl.ONBOARDING.MFA_LOGIN);
      } catch (error) {
        /**
         * If the login fails, we set the isAuthenticated state to false
         * and store the error message in the errorMessage state
         */
        setErrorMessage(
          error?.response?.data?.detail?.toString() ||
            "Oops! Something went wrong",
        );
        setIsAuthenticated(false);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    },
    [loginQuery, navigate],
  );

  const verifyMFA = useCallback(
    async (otp: string) => {
      try {
        setIsLoading(true);
        setIsError(false);

        const data = await loginMfaQuery.mutateAsync({ key: loginKey, otp });
        if (!data.access_token || !data.refresh_token) {
          throw new Error("");
        }

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        setIsAuthenticated(true);
        setIsLoggedOut(false);
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.detail?.toString() ||
            "Oops! Something went wrong",
        );
        setIsError(true);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    },
    [loginKey, loginMfaQuery],
  );

  /**
   * Calls the refresh API to keep the user logged in
   *
   * If the refresh token is not present in the local storage, it throws an error
   * If the refresh API call fails, it logs out the user
   * If the refresh API call succeeds, it sets the isAuthenticated state to true
   * and stores the new access token and refresh token in the local storage
   */
  const track = useCallback(
    async (showLoading = true) => {
      try {
        setIsLoading(showLoading && true);
        const refresh_token = localStorage.getItem("refresh_token");
        if (!refresh_token) {
          throw new Error();
        }
        if (isAuthenticated) return;

        const res = await refreshQuery.refetch();
        if (res.status === "error") {
          throw new Error("");
        }
        //Check if is Error throw error

        setIsAuthenticated(true);
        setIsLoggedOut(false);
        setIsLoggedIn(true);

        localStorage.setItem("access_token", res.data.access_token);
      } catch (error) {
        console.error(error);
        reset();
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, refreshQuery, reset],
  );

  /**
   * Logs out the user by removing the access token and refresh token from
   * local storage and resetting the login mutation.
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      await logoutQuery.refetch();

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoggedOut(true);

      reset();
      setIsAuthenticated(false);
      setIsLoggedIn(false);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.toString() || "Oops! Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  }, [reset, logoutQuery]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        errorMessage,
        isError:
          loginQuery.isError ||
          logoutQuery.isError ||
          loginMfaQuery.isError ||
          isError,
        isLoading,
        isLoggedIn,
        isLoggedOut,
        login,
        track,
        logout,
        reset,
        verifyMFA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
