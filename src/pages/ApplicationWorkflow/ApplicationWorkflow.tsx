import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAddServiceToApplication,
  useGetApplicationDetails,
  useGetServiceList,
} from "react-query";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { Col, Dropdown, Flex, MenuProps, Row } from "antd";
import classNames from "classnames";
import { RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { AppServiceMap, AppServiceType } from "interfaces";

import { AddIcon, CodescanIcon, DiagnosticsIcon, ExperimentIcon, ToilAssistIcon, TraceAssistIcon, DashboardAssistIcon, DriftAssistIcon, SLOSLIIcon } from "assets";

import { ConfigureGremlin, IconViewer, Loading, Text } from "components";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./applicationWorkflow.styles.scss";
import { ToilAssist } from "pages/ToilAssist";
import { TraceAssist } from "pages/TraceAssist";
import { DashboardAssist } from "pages/DashboardAssist";
import { DriftAssist } from "pages/DriftAssist";

const serviceMap: Record<string, string> = {
  resiliency_index: "Infrastructure",
  code_hygiene_standards: "Repositories",
  pipelines: "Pipelines",
  experiments: "Experiments",
  "health-checks": "Health Checks",
  agents: "Agents",
  "toil-assist": "ToilAssist",
  "dashboard-assist": "DashboardAssist",
  "trace-assist": "TraceAssist",
  "slo-sli": "SLOSLI",
};

const serviceMenuMap = {
  Infrastructure: {
    name: "Resiliency Index",
    desc: "Continuous Resiliency",
    icon: DiagnosticsIcon,
    route: RouteUrl.APPLICATIONS.RESILIENCY_INDEX,
  },
  Repositories: {
    name: "Code Hygiene",
    desc: "Code level Resiliency posture",
    icon: CodescanIcon,
    route: RouteUrl.APPLICATIONS.CODE_HYGIENCE_STANDARDS,
  },
  // Pipelines: {
  //   // TODO: change to Experiments
  //   name: "Chaos Experiments",
  //   desc: "Validate Resiliency",
  //   icon: ExperimentIcon,
  //   // route: RouteUrl.APPLICATIONS.EXPERIMENT,
  // },
  Experiments: {
    name: "Chaos Experiments",
    desc: "Validate Resiliency",
    icon: ExperimentIcon,
    route: RouteUrl.APPLICATIONS.CHAOS_EXPERIMENT,
  },
  ToilAssist: {
    name: "Toil Assist",
    desc: "For SelfHealing",
    icon: ToilAssistIcon,
  },
  DashboardAssist: {
    name: "Dashboard Assist",
    desc: "Custom Dashboard",
    icon: DashboardAssistIcon,
  },
  TraceAssist: {
    name: "Trace Assist",
    desc: "Application Dashboard",
    icon: TraceAssistIcon,
  },
  SLOSLI: {
    name: "SLO/SLI",
    desc: "Service Level Objectives and Indicators",
    icon: SLOSLIIcon,
  },
  DriftAssist: {
    name: "Drift Assist",
    desc: "Detecting and Analyzing infrastructure drift",
    icon: DriftAssistIcon,
  },
};

const servicePriorityMap: Record<string, number> = {
  1: 1,
  3: 2,
  2: 3,
};

const ApplicationWorkflow: React.FC = () => {
  const location = useLocation();
  const [activeKey, setActiveKey] = useState("");
  const { refetchApplicationDetails } = useAppNavigation();
  const [showAddService, setShowAddService] = useState(false);
  const [isOpenConfigureGremlin, setIsOpenConfigureGremlin] =
    useState<boolean>(false);

  const navigate = useNavigate();
  const params = useParams();

  // Check if user is coming from Drift Assist configuration
  const driftAssistState = location.state?.sessionId ? location.state : null;
  
  // Log navigation state for debugging
  useEffect(() => {
    console.log('🏗️ ApplicationWorkflow: Component mounted/updated');
    console.log('📍 ApplicationWorkflow: Current location:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    });
    
    if (location.state) {
      console.log('📦 ApplicationWorkflow: Navigation state received:', {
        hasSessionId: !!location.state.sessionId,
        sessionId: location.state.sessionId,
        hasAwsCredentials: !!location.state.awsCredentials,
        awsCredentials: location.state.awsCredentials,
        allStateKeys: Object.keys(location.state)
      });
    } else {
      console.log('📦 ApplicationWorkflow: No navigation state found');
    }
    
    if (driftAssistState) {
      console.log('🎯 ApplicationWorkflow: DriftAssist state detected:', driftAssistState);
    } else {
      console.log('🎯 ApplicationWorkflow: No DriftAssist state detected');
    }
  }, [location, driftAssistState]);

  const applicationData = useGetApplicationDetails(params?.application);
  const addServiceToApplicationQuery = useAddServiceToApplication();
  const serviceList = useGetServiceList();

  const navmenu = useMemo(() => {
    return applicationData?.data?.services?.map((s) => s.service) || [];
  }, [applicationData]);

  const serviceMenu = useMemo(() => {
    return Object.keys(serviceMenuMap)
      .filter((key) => !navmenu.includes(key))
      .map((key) => {
        return {
          key,
          label: (
            <Flex gap={Metrics.SPACE_XS}>
              <IconViewer
                Icon={serviceMenuMap[key].icon}
                size={Metrics.SPACE_XL}
                color={Colors.COOL_GRAY_12}
              />
              <Text
                text={serviceMenuMap[key].name}
                type="cardtitle"
                weight="semibold"
                color={Colors.COOL_GRAY_12}
              />
            </Flex>
          ),
        };
      });
  }, [navmenu]);
  const [showDashboardAssist, setShowDashboardAssist] = useState(false);
  const [showDriftAssist, setShowDriftAssist] = useState(false);
  const onNavigate = useCallback(
  (key: string) => {
    if (key && key !== activeKey) {
      setActiveKey(
        key === "Agents" || key === "Health Checks" ? "Experiments" : key,
      );
      if (key === "TraceAssist") {
        setShowTraceAssist(true);
        setShowToilAssist(false);
        setShowDashboardAssist(false);
        setShowDriftAssist(false);
        return;
      } else if (key === "ToilAssist") {
        setShowToilAssist(true);
        setShowTraceAssist(false);
        setShowDashboardAssist(false); 
        setShowDriftAssist(false);
        return;
      } else if (key === "DashboardAssist") { 
        setShowDashboardAssist(true); 
        setShowTraceAssist(false); 
        setShowToilAssist(false); 
        setShowDriftAssist(false);
        return; 
      } else if (key === "DriftAssist") {
        setShowDriftAssist(true);
        setShowTraceAssist(false);
        setShowToilAssist(false);
        setShowDashboardAssist(false);
        return;
      } else {
        setShowTraceAssist(false);
        setShowToilAssist(false);
        setShowDashboardAssist(false); 
        setShowDriftAssist(false);
      }
      navigate(
        resolveUrlParams(
          key === "Agents"
            ? RouteUrl.APPLICATIONS.AGENTS
            : key === "Health Checks"
            ? RouteUrl.APPLICATIONS.HEALTH_CHECKS
            : serviceMenuMap[key].route,
          {
            project: params.project,
            application: params.application,
          },
        ),
      );
    }
  },
  [activeKey, params.project, params.application, navigate],
);
  const [showTraceAssist, setShowTraceAssist] = useState(false);
  const [showToilAssist, setShowToilAssist] = useState(false); 
  
  useEffect(() => {
    if (activeKey === "") {
      const service = location.pathname.split("/")?.pop()?.split("?")?.[0];

      onNavigate(
        service === "workflow" ? "Infrastructure" : serviceMap[service] || "",
      );
    }
  }, [location.pathname, activeKey, navmenu, onNavigate]);

  // Auto-activate DriftAssist if user is coming from dashboard configuration
  useEffect(() => {
    if (driftAssistState?.sessionId) {
      setShowDriftAssist(true);
      setShowTraceAssist(false);
      setShowToilAssist(false);
      setShowDashboardAssist(false);
      setActiveKey("DriftAssist");
    }
  }, [driftAssistState]);
  
  const getServiceId = useCallback(
    async (service: AppServiceType) => {
      const application = applicationData.data;
      const existingService = application?.services?.find(
        (s) => s.service == service,
      );
      if (application && existingService) {
        return existingService.id;
      }
      
      const res = await addServiceToApplicationQuery.mutateAsync({
        application_id: application.id,
        service_id: AppServiceMap[service],
      });
      await applicationData.refetch();

      return res.app_service_id;
    },
    [addServiceToApplicationQuery, applicationData],
  );

  const onAddService: MenuProps["onClick"] = async ({ key }) => {
    if (key) {
      try {
        await getServiceId(key as AppServiceType);
        onNavigate(key);
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (applicationData?.isLoading) return <Loading type="spinner" />;
  
  if (
    location.pathname ===
    resolveUrlParams(RouteUrl.APPLICATIONS.AGENT_INSTALATION_GUIDE, {
      project: params.project,
      application: params.application,
    })
  ) {
    return <Outlet />;
  }

  /**
   * Checks if a service with the given name exists in the navigation menu.
   *
   * @param {string} service_name - The name of the service to check for existence.
   * @return {string | undefined} The service name if it exists, otherwise undefined.
   */
  const serviceExist = (service_name: string) => {
    return navmenu.find((value) => value === service_name);
  };

  return (
    <Row className="application-workflow-container">
      <Col sm={24} md={7} className="application-workflow-nav">
        <Flex
          align="center"
          justify="center"
          vertical
          className="nav-menu-container"
        >
          {Object.keys(serviceMenuMap).map((serviceName, index) => {
            const isAdded = navmenu.includes(serviceName);

            return (
              <Flex
                key={serviceName}
                vertical
                align="center"
                className="nav-item-container"
                style={{
                  opacity: isAdded ? "1" : "0.6",
                  cursor: "pointer",
                }}
              >
                <Flex
                  align="center"
                  justify="center"
                  onClick={async () => {
                    if (serviceName === "TraceAssist") {
                      setShowTraceAssist(true);
                      setShowDashboardAssist(false); 
                      setShowDriftAssist(false);
                      return;
                    }
                    if (serviceName === "ToilAssist") {
                      setShowToilAssist(true);
                      setShowDashboardAssist(false); 
                      setShowDriftAssist(false);
                      return;
                    }
                    if (serviceName === "DashboardAssist") { 
                      setShowDashboardAssist(true); 
                      setShowTraceAssist(false); 
                      setShowToilAssist(false); 
                      setShowDriftAssist(false);
                      return; 
                    }
                    if (serviceName === "DriftAssist") {
                      setShowDriftAssist(true);
                      setShowTraceAssist(false);
                      setShowToilAssist(false);
                      setShowDashboardAssist(false);
                      return;
                    }
                    if (!isAdded) {
                      if (serviceName === "Experiments") {
                        setIsOpenConfigureGremlin(true);
                        return;
                      }
                      await getServiceId(serviceName as AppServiceType);
                    }
                    onNavigate(serviceName);
                  }}
                  className={classNames("nav-item", {
                    active: activeKey === serviceName,
                  })}
                  onMouseEnter={() => setShowAddService(true)}
                  onMouseLeave={() => setShowAddService(false)}
                >
                  <Flex
                    align="center"
                    gap={Metrics.SPACE_SM}
                    className="nav-item-content"
                  >
                    <Flex className="nav-item-icon">
                      <IconViewer
                        Icon={serviceMenuMap[serviceName]?.icon}
                        size={Metrics.SPACE_XL}
                      />
                    </Flex>
                    <Flex vertical>
                      <Text
                        text={serviceMenuMap[serviceName].name}
                        type="cardtitle"
                        weight="semibold"
                      />
                      <Text
                        text={serviceMenuMap[serviceName].desc}
                        type="footnote"
                      />
                    </Flex>
                  </Flex>
                </Flex>
                {index !== Object.keys(serviceMenuMap).length - 1 && (
                  <Flex className="connector"> </Flex>
                )}
              </Flex>
            );
          })}
          
          {/* {serviceMenu && serviceMenu.length > 0 && (
            <Flex
              justify="center"
              onMouseEnter={() => setShowAddService(true)}
              onMouseLeave={() => setShowAddService(false)}
              className="add-service-btn-container"
            >
              <Dropdown
                menu={{
                  items: serviceMenu,
                  onClick: (props) => {
                    if (props.key === "Experiments") {
                      setIsOpenConfigureGremlin(true);
                      return;
                    }
                    onAddService(props);
                  },
                }}
                trigger={["click"]}
                placement="bottom"
              >
                <Flex
                  style={{
                    visibility: showAddService ? "visible" : "hidden",
                    opacity: showAddService ? "1" : "0",
                  }}
                  onClick={(e) => e.preventDefault()}
                  className="add-service-btn"
                >
                  <IconViewer Icon={AddIcon} size={Metrics.SPACE_XL} />
                </Flex>
              </Dropdown>
            </Flex>
          )} */}
        </Flex>
        <ConfigureGremlin
          isOpen={isOpenConfigureGremlin}
          onSuccess={async () => {
            await refetchApplicationDetails();
            setIsOpenConfigureGremlin(false);
            await refetchApplicationDetails();
            navigate(
              resolveUrlParams(RouteUrl.APPLICATIONS.EXPERIMENT, {
                project: params.project,
                application: params?.applicationData,
              }),
            );
          }}
          onClose={() => setIsOpenConfigureGremlin(false)}
          applicationId={params?.application}
        />
      </Col>
      <Col sm={24} md={17} className="application-workflow-content">
        {showToilAssist ? (
          <ToilAssist onClose={() => setShowToilAssist(false)} />
        ) : showTraceAssist ? (
          <TraceAssist onClose={() => setShowTraceAssist(false)} />
        ) : showDashboardAssist ? ( 
          <DashboardAssist onClose={() => setShowDashboardAssist(false)} /> 
        ) : showDriftAssist ? (
          <DriftAssist 
            onClose={() => setShowDriftAssist(false)} 
            onNavigateToWorkflow={() => {
              // This callback will be triggered when analysis starts
              // The user is already in the workflow tab, so we just need to ensure
              // the DriftAssist remains active and visible
              console.log('Analysis started - staying in workflow tab');
            }}
            // Pass session state from navigation if available
            initialSessionId={driftAssistState?.sessionId}
            initialAwsCredentials={driftAssistState?.awsCredentials}
          />
        ) : (
          <Outlet />
        )}
      </Col>
    </Row>
  );
};

export default ApplicationWorkflow;
