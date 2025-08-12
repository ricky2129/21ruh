import React, { useEffect } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { Flex, Space } from "antd";
import { RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";

import { Button } from "components";

import { Metrics } from "themes";

import "./chaosExperiments.styles.scss";

interface Route {
  path: string;
  name: string;
}

const Routes: Route[] = [
  { path: RouteUrl.APPLICATIONS.AGENTS, name: "Agents" },
  { path: RouteUrl.APPLICATIONS.EXPERIMENT, name: "Experiments" },
  // { path: RouteUrl.APPLICATIONS.HEALTH_CHECKS, name: "Health Checks" },
];
const ChaosExperiments: React.FC = () => {
  const { project, application } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname ===
      resolveUrlParams(RouteUrl.APPLICATIONS.CHAOS_EXPERIMENT, {
        project,
        application,
      })
    ) {
      navigate(
        resolveUrlParams(RouteUrl.APPLICATIONS.AGENTS, {
          project,
          application,
        }),
      );
    }
  }, [location, application, project, navigate]);

  const checkcurrentRoute = (path: string): boolean => {
    return (
      resolveUrlParams(path, {
        project,
        application,
      }) === window.location.pathname
    );
  };

  if (
    location.pathname ===
    resolveUrlParams(RouteUrl.APPLICATIONS.AGENT_INSTALATION_GUIDE, {
      project,
      application,
    })
  ) {
    return <Outlet />;
  }

  return (
    <Flex vertical className="chaos-experiments-container">
      <Flex align="center" justify="center" wrap gap={Metrics.SPACE_MD}>
        <Space.Compact>
          {Routes.map((route, index) => (
            <Link
              key={index}
              to={resolveUrlParams(route.path, {
                project,
                application,
              })}
            >
              <Button
                key={index}
                title={route.name}
                size="middle"
                type="default"
                customClass={`${checkcurrentRoute(route?.path) ? "chaos-active-link" : "chaos-link"} semibold`}
                disabled={route.path === RouteUrl.APPLICATIONS.HEALTH_CHECKS}
              />
            </Link>
          ))}
        </Space.Compact>
      </Flex>
      <Outlet />
    </Flex>
  );
};

export default ChaosExperiments;
