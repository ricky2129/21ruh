import { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

import { RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { AppLayout } from "layout";

import { Loading } from "components";

import { useAuth } from "context/AuthProvider";

/**
 * If isAuthenticated is false, redirect to /onboarding/login
 * Otherwise, render the contents of the outlet
 * @returns either a Navigate component to /onboarding/login or the Outlet component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isLoggedOut, track } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const params = useParams();

  useEffect(() => {
    track();

    const timeout = setInterval(
      () => {
        track(false);
      },
      9 * 60 * 1000,
    );

    return () => clearInterval(timeout);
  }, []);

  if (!isLoading && !isAuthenticated) {
    return (
      <Navigate
        to={RouteUrl.ONBOARDING.LOGIN}
        state={{ from: isLoggedOut ? RouteUrl.HOME.DASHBOARD : currentPath }}
        replace
      />
    );
  }

  return (
    <>
      {currentPath ===
      resolveUrlParams(RouteUrl.APPLICATIONS.AGENT_INSTALATION_GUIDE, {
        project: params?.project ?? "",
        application: params?.application ?? "",
      }) ? (
        children
      ) : (
        <AppLayout>{children}</AppLayout>
      )}
      {isLoading && <Loading type="spinner" />}
    </>
  );
};

export default ProtectedRoute;
