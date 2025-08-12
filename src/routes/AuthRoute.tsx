import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { RouteUrl } from "constant";

import { useAuth } from "context";
import { Loading } from "components";

interface AuthRouteProps {
  children: JSX.Element; // The component will be rendered if the user is authenticated
}

/**
 * If isAuthenticated is true, redirect to /
 * Otherwise, render the contents of the outlet
 * @returns either a Navigate component to /onboarding/login or the Outlet component
 */
const AuthRoute: React.FC<AuthRouteProps> = ({
  children,
}): JSX.Element | null => {
  const { isLoggedIn, isAuthenticated, isLoading, track } = useAuth();
  const location = useLocation();

  useEffect(() => {
    track();
  }, []);

  if(isLoading) <Loading type="spinner" />

  if (!isLoading && isLoggedIn && isAuthenticated) {
    const state = location.state;
    if (state?.from) return <Navigate to={state.from} replace />;
    return <Navigate to={RouteUrl.HOME.DASHBOARD} replace />;
  }

  return children;
};

export default AuthRoute;
