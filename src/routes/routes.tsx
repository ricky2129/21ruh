/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from "react";
import { Outlet, createBrowserRouter } from "react-router-dom";

import { PortfolioMenu, SidenavMenu } from "constant";
import ProtectedRoute from "routes/ProtectedRoute";

import { Loading } from "components";
import { Trial } from "components/Trial";

import App from "../App";
import AuthRoute from "./AuthRoute";

const Signup = lazy(() =>
  import("pages/Signup").then(({ Signup }) => ({
    default: Signup,
  })),
);

const LoginForm = lazy(() =>
  import("components/Login/LoginForm").then(({ LoginForm }) => ({
    default: LoginForm,
  })),
);

const LoginMFA = lazy(() =>
  import("components/Login/LoginMFA").then(({ LoginMFA }) => ({
    default: LoginMFA,
  })),
);

const Onboarding = lazy(() =>
  import("pages/Onboarding").then(({ Onboarding }) => ({
    default: Onboarding,
  })),
);

const ForgetPasswordSuccess = lazy(() =>
  import("components/ForgetPassword/SuccessPage").then(({ SuccessPage }) => ({
    default: SuccessPage,
  })),
);

const ForgetPasswordInputScreen = lazy(() =>
  import("components/ForgetPassword/InputScreen").then(({ InputScreen }) => ({
    default: InputScreen,
  })),
);

const Project = lazy(() =>
  import("pages/Project").then(({ Project }) => ({
    default: Project,
  })),
);

const CreateNewProject = lazy(() =>
  import("pages/CreateNewProject").then(({ CreateNewProject }) => ({
    default: CreateNewProject,
  })),
);

const ProjectDashboard = lazy(() =>
  import("pages/ProjectDashboard").then(({ ProjectDashboard }) => ({
    default: ProjectDashboard,
  })),
);

const Application = lazy(() =>
  import("pages/Application").then(({ Application }) => ({
    default: Application,
  })),
);

const CreateNewApplication = lazy(() =>
  import("pages/CreateNewApplication").then(({ CreateNewApplication }) => ({
    default: CreateNewApplication,
  })),
);

const ApplicationDiagnostics = lazy(() =>
  import("pages/ApplicationDiagnostics").then(({ ApplicationDiagnostics }) => ({
    default: ApplicationDiagnostics,
  })),
);

const ApplicationCodescan = lazy(() =>
  import("pages/ApplicationCodescan").then(({ ApplicationCodescan }) => ({
    default: ApplicationCodescan,
  })),
);

const ProjectMembersRouteWrapper = lazy(() =>
  import("pages/ProjectMembers").then((m) => ({
    default: m.ProjectMembersRouteWrapper,
  }))
);

const ChaosExperiments = lazy(() =>
  import("pages/ChaosExperiments").then(({ ChaosExperiments }) => ({
    default: ChaosExperiments,
  })),
);

const HealthChecks = lazy(() =>
  import("pages/HealthChecks").then(({ HealthChecks }) => ({
    default: HealthChecks,
  })),
);

const Agents = lazy(() =>
  import("pages/Agents").then(({ Agents }) => ({
    default: Agents,
  })),
);

const Experiments = lazy(() =>
  import("pages/Experiments").then(({ Experiments }) => ({
    default: Experiments,
  })),
);

const ApplicationWorkflow = lazy(() =>
  import("pages/ApplicationWorkflow").then(({ ApplicationWorkflow }) => ({
    default: ApplicationWorkflow,
  })),
);

const ApplicationDashboard = lazy(() =>
  import("pages/ApplicationDashboard").then(({ ApplicationDashboard }) => ({
    default: ApplicationDashboard,
  })),
);

const AgentInstallationGuide = lazy(() =>
  import("pages/AgentInstallationGuide").then(({ AgentInstallationGuide }) => ({
    default: AgentInstallationGuide,
  })),
);

const DriftAssist = lazy(() =>
  import("pages/DriftAssist").then((module) => ({
    default: module.DriftAssist,
  })),
);

const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "onboarding",
        element: (
          <Suspense fallback={<Loading type="spinner" />}>
            <AuthRoute>
              <Onboarding />
            </AuthRoute>
          </Suspense>
        ),
        children: [
          {
            index: true,
            path: "login",
            element: (
              <Suspense fallback={<Loading type="spinner" />}>
                <LoginForm />
              </Suspense>
            ),
          },
          {
            index: true,
            path: "mfa-login",
            element: (
              <Suspense fallback={<Loading type="spinner" />}>
                <LoginMFA />
              </Suspense>
            ),
          },
          {
            path: "signup",
            element: (
              <Suspense fallback={<Loading type="spinner" />}>
                <Signup />
              </Suspense>
            ),
          },
          {
            element: (
              <Suspense fallback={<Loading type="spinner" />}>
                <ForgetPasswordSuccess />
              </Suspense>
            ),
            path: "forget-password-success",
          },
          {
            element: (
              <Suspense fallback={<Loading type="spinner" />}>
                <ForgetPasswordInputScreen />
              </Suspense>
            ),
            path: "forgot-password",
          },
        ],
      },
      {
        path: "/",
        element: (
          <Suspense fallback={<Loading type="spinner" />}>
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          </Suspense>
        ),
        handle: {
          crumb: () => "Home",
          menu: () => SidenavMenu.HOME_PORTFOLIO,
        },
        children: [
          {
            path: "",
            element: (
              <Suspense fallback={<Loading type="spinner" />}>
                <Project />
              </Suspense>
            ),
          },
          {
            path: "/create-portfolio",
            element: (
              <Suspense fallback={<Loading type="spinner" />}>
                <CreateNewProject />
              </Suspense>
            ),
            handle: {
              crumb: () => "Create Portfolio",
              menu: () => SidenavMenu.HOME_PORTFOLIO,
            },
          },
          {
            path: "/insight",
            element: (
              <Suspense fallback={<Loading type="spinner" />}>
                <Project />
              </Suspense>
            ),
            handle: {
              crumb: () => "Insights",
              menu: () => SidenavMenu.HOME_INSIGHTS,
            },
          },
          {
            path: "/project/:project",
            element: <Outlet />,
            handle: {
              crumb: () => ":project",
            },
            children: [
              {
                path: "",
                element: (
                  <Suspense fallback={<Loading type="spinner" />}>
                    <ProjectDashboard />
                  </Suspense>
                ),
                handle: {
                  crumb: () => "Dashboard",
                  menu: () => SidenavMenu.PORTFOLIO_DASHBOARD,
                },
              },
              {
                path: "members",
                element: (
                  <Suspense fallback={<Loading type="spinner" />}>
                    <ProjectMembersRouteWrapper />
                  </Suspense>
                ),
                handle: {
                  crumb: () => "Members",
                  menu: () => SidenavMenu.PORTFOLIO_MEMBERS
                },
              },
              {
                path: "application",
                element: (
                  <Suspense fallback={<Loading type="spinner" />}>
                    <Outlet />
                  </Suspense>
                ),
                handle: {
                  crumb: () => "Applications",
                  menu: () => SidenavMenu.PORTFOLIO_APPLICATIONS,
                },
                children: [
                  {
                    path: "",
                    element: (
                      <Suspense fallback={<Loading type="spinner" />}>
                        <Application />
                      </Suspense>
                    ),
                  },
                  {
                    path: ":application",
                    element: (
                      <Suspense fallback={<Loading type="spinner" />}>
                        <Outlet />
                      </Suspense>
                    ),
                    handle: {
                      crumb: () => ":application",
                      menu: () => SidenavMenu.APPLICATIONS_DASHBOARD,
                    },
                    children: [
                      {
                        path: "",
                        element: (
                          <Suspense fallback={<Loading type="spinner" />}>
                            <ApplicationDashboard />
                          </Suspense>
                        ),
                        handle: {
                          crumb: () => "Dashboard",
                        },
                      },
                      {
                        path: "workflow",
                        element: (
                          <Suspense fallback={<Loading type="spinner" />}>
                            <ApplicationWorkflow />
                          </Suspense>
                        ),
                        handle: {
                          menu: () => SidenavMenu.APPLICATIONS_WORKFLOW,
                        },
                        children: [
                          {
                            path: "resiliency_index",
                            element: (
                              <Suspense fallback={<Loading type="spinner" />}>
                                <ApplicationDiagnostics />
                              </Suspense>
                            ),
                            handle: {
                              crumb: () => "Resiliency Index",
                            },
                          },
                          {
                            path: "code_hygiene_standards",
                            element: (
                              <Suspense fallback={<Loading type="spinner" />}>
                                <ApplicationCodescan />
                              </Suspense>
                            ),
                            handle: {
                              crumb: () => "Code Hygiene",
                            },
                          },
                          {
                            path: "chaos-experiments",
                            element: (
                              <Suspense fallback={<Loading type="spinner" />}>
                                <ChaosExperiments />
                              </Suspense>
                            ),
                            handle: {
                              crumb: () => "Chaos Experiments",
                            },
                            children: [
                              {
                                path: "experiments",
                                element: (
                                  <Suspense fallback={<Loading type="spinner" />}>
                                    <Experiments />
                                  </Suspense>
                                ),
                                handle: {
                                  crumb: () => "Experiments",
                                },
                              },
                              {
                                path: "agents",
                                element: (
                                  <Suspense fallback={<Loading type="spinner" />}>
                                    <Agents />
                                  </Suspense>
                                ),
                                handle: {
                                  crumb: () => "Agents",
                                },
                              },
                              {
                                path: "agent-installation-guide",
                                element: (
                                  <Suspense fallback={<Loading type="spinner" />}>
                                    <AgentInstallationGuide />
                                  </Suspense>
                                ),
                              },
                              {
                                path: "health-checks",
                                element: (
                                  <Suspense fallback={<Loading type="spinner" />}>
                                    <HealthChecks />
                                  </Suspense>
                                ),
                                handle: {
                                  crumb: () => "Health Checks",
                                },
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                path: "create-application",
                element: (
                  <Suspense fallback={<Loading type="spinner" />}>
                    <CreateNewApplication />
                  </Suspense>
                ),
                handle: {
                  crumb: () => "Create Application",
                  menu: () => SidenavMenu.PORTFOLIO_DASHBOARD,
                },
              },
            ],
          },
        ],
      },
      {
        path: "/trial",
        element: (
          <Suspense fallback={<Loading type="spinner" />}>
            <Trial />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <div>Not Found</div>,
      },
    ],
  },
]);

export default routes;
