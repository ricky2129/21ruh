//API Base URL
const BASE_URL: string = import.meta.env.VITE_BASE_URL;
const TRACE_ASSIST_BASE_URL : string = import.meta.env.VITE_TRACE_ASSIST_URL;
const TOIL_ASSIST_BASE_URL : string = import.meta.env.VITE_TOIL_ASSIST_URL;
const DASHBOARD_ASSIST_BASE_URL : string = import.meta.env.VITE_DASHBOARD_ASSIST_URL;
const DRIFT_ASSIST_BASE_URL : string = import.meta.env.VITE_DRIFT_ASSIST_URL;

export const ApiUrl = {
  //Base URL
  BASE_URL,
  TRACE_ASSIST_BASE_URL,

  // Signup URLs
  SIGNUP: "/signup",
  GENERATE_MFA: "/mfaQR",

  //auth URLs
  LOGIN: "/login",
  LOGIN_MFA: "/loginMfa",
  LOGOUT: "/logout",
  REFRESH: "/refresh",

  //Project URLs
  GET_ALL_PROJECTS: "/project/list",
  GET_PROJECT_DETAILS: "/project/details/:project_id",
  GET_USER_PROJECTS: "/project/dashboard",
  CREATE_PROJECT: "/project/create",
  GET_ACCESS_LIST: "/project/accessList",
  UPDATE_PROJECT: "/project/update",
  ADD_MEMBER_TO_PROJECT: "/project/addMember",
  DELETE_MEMBER_IN_PROJECT: "/project/deleteMember",
  UPDATE_MEMBER_IN_PROJECT: "/project/updateMember",
  ADD_TEAM_TO_PROJECT: "/project/addTeam",
  UPDATE_TEAM_IN_PROJECT: "/project/updateTeam",
  DELETE_TEAM_IN_PROJECT: "/project/deleteTeam",
  ADD_EMAIL_NOTIFICATION: "/project/addEmailNotification",
  UPDATE_EMAIL_NOTIFICATION: "/project/updateEmailNotification",
  DELETE_EMAIL_NOTIFICATION: "/project/deleteEmailNotification",
  GET_EMAIL_NOTIFICATION: "/project/EmailNotification",
  CHECK_PROJECT_NAME: "/project/checkProjectName",
  CANCEL_PROJECT: "/project/cancel/:project_id",
  DELETE_PROJECT: "/project/delete/:project_id",

  // Application URLs
  GET_APPLICATION_DETAILS: "/application/details/:application_id",
  GET_ALL_APPLICATIONS: "/project/applications/:project_id",
  CHECK_APPLICATION_NAME: "/application/checkApplicationName",
  CREATE_APPLICATION: "/application/create",
  ADD_MEMBER_TO_APPLICATION: "/application/addMember",
  UPDATE_MEMBER_IN_APPLICATION: "/application/updateMember",
  DELETE_MEMBER_IN_APPLICATION: "/application/deleteMember",
  GET_SLO_DATA: "/application/listSlo",
  ADD_SLO_DATA: "/application/addSlo",
  DELETE_SLO_DATA: "/application/deleteSlo",
  UPDATE_SLO_DATA: "/application/updateSlo",
  GET_SERVICE_LIST: "/application/service_list",
  GET_APPLICATION_ACCESS_LIST: "/application/accessList",
  ADD_TEAM_TO_APPLICATION: "/application/addTeam",
  UPDATE_TEAM_TO_APPLICATION: "/application/updateTeam",
  DELETE_TEAM_IN_APPLICATION: "/application/deleteTeam",
  ADD_SERVICE_TO_APPLICATION: "/application/addService",
  CANCEL_APPLICATION: "/application/cancel/:application_id",
  DELETE_APPLICATION: "/application/delete/:application_id",

  // Infra URLs
  GET_INFRA_RESOURCES: "/infra/resources",
  GET_INFRA_RESOURCE_LIST: "/infra/resourse_list",
  GET_RESILIENCY_POLICY_LIST: "/infra/resiliency_policy/list",
  CREATE_RESILIENCY_POLICY: "/infra/resiliency_policy/create_resiliency_policy",
  CREATE_ENVIRONMENT: "/infra/resilience_hub/create_app",
  CREATE_INFRA_SCHEDULE: "/infraResilience/scheduler",
  CREATE_RESOURCE_GROUP: "/infra/create-resource-group",
  LIST_RESOURCE_GROUP: "/infra/list-resource-group",
  RESILENCY_UPDATE_ACTION_TOKEN: "/infra/resiliency-update-action-taken",

  //Integration URLs
  GET_SECRETS_PROJECTID:
    "/integration/list_secrets/:infrastructure_id/:project_id",
  GET_SECRETS_APPLICATIONID:
    "/integration/list_secret_keys/:infrastructure_id/:application_id",
  CREATE_AWS_SECRET: "/integration/createAwsSecret",
  CREATE_GITHUB_SECRET: "/integration/createGithubSecret",
  UPDATE_INTEGRATION: "/integration/updateIntegration",
  CREATE_GREMLIN_SECRET: "/integration/createGremlinSecret",
  GET_SECRET_VALUES: "/integration/get_secret_values/:integration_id",

  //User URLs
  SEARCH_USER: "/usersearchquery",
  GET_USER_ROLES: "/user/roles",
  GET_USER_PROFILE: "/user/profile",

  //Team URLs
  GET_TEAM_LIST: "/team/list",
  GET_TEAM_DETAILS: "/team/teamDetails/:id",

  // Diagnostics URLs
  GET_DIAGNOSTICS_VERSIONS_LIST:
    "/infra/assessment/list_versions/:service_env_id",
  GET_DIAGNOSTICS_REPORT: "/infra/assessment/show_mongo_reports",
  RUN_DIAGNOSTICS: "/infra/assessment/start_assessment/:service_env_id",

  //Codescan URLs
  CLONE_REPO: "/scanning/clone-repo",
  FETCH_CODESCAN_DASHBOARD:
    "/scanning/fetch-gen-ai-dashboard/:service_env_id/:version",
  FETCH_CODE: "/scanning/fetch-code/:service_env_id/:version",
  RESCAN: "/scanning/re-scan",
  TOTAL_VERSIONS: "/scanning/totalVersions/:service_env_id",
  CODE_SCANS: "/scanning/codeScans/:service_env_id/:version",
  UPDATE_ACTION_TAKEN: "/scanning/update-action-taken",
  ANALYZE_REPO: "/scanning/analyze-repo/:service_env_id",

  // Experiments URLs
  GET_SCENARIO_LISTS: "/choas/scenario_lists",
  GET_CHAOS_DATA: "/choas/data/:service_env_id/:version",
  GET_CHAOS_VERSIONS: "/choas/version/",
  RERUN_CHOAS_SCAN: "/choas/ReRunExperiments/:service_env_id/",
  DOWNLOAD_CONFIG_FILE: "/choas/config/file/:app_service_id",
  CREATE_EXPERIMENT: "/choas/CreateScenarios",
  GET_CHAOS_AGENTS: "/choas/clients/:app_service_id",
  GET_ACTIVE_AGENTS: "/choas/clients/active/:app_service_id",
  HALT_EXPERIMENT: "/choas/halt/",
  GET_ACTIVE_HEALTHCHECKS: "/choas/active/healthchecks/:app_service_id",

  //Applicatrion Dashboard URLs
  GET_APP_DASHBOARD_DETAILS: "/kpi/application/details/:app_service_id",
  GET_APP_DASHBOARD_RECOMMENDATION_TABLE_DETAILS:
    "/kpi/application/recommendations_feed/:app_service_id",
  GET_APP_RELIABILITY_SCORE:
    "/kpi/application/app_reliability_score/:app_id?environment_name=134",
  GET_APP_RELIABILITY_POSTURE: "/kpi/application/reliability_posture/:app_id",

  // Portfolio Dashboard URLs
  GET_PORTFOLIO_GRAPH_DATA: "/kpi/project/reliability_postures/:project_id",
  GET_PORTFOLIO_DETAILS: "/kpi/project/details/:project_id",
  GET_PORTFOLIO_RECOMMENDATION_TABLE:
    "/kpi/project/recommendations_feed/:project_id",

};
export const TraceAssistUrl = {
  CREATE_DEPLOYMENT: `${TRACE_ASSIST_BASE_URL}/deployments`,
  GET_DEPLOYMENT_DETAILS: `${TRACE_ASSIST_BASE_URL}/deployments/:deployment_name`,
  INSTRUMENT_DEPLOYMENT: `${TRACE_ASSIST_BASE_URL}/deployments/:deployment_name/instrument`,
  GET_ALL_DEPLOYMENTS: `${TRACE_ASSIST_BASE_URL}/deployments`,
};

export const ToilAssistUrl = {
  GET_PROJECT_TICKETS: `${TOIL_ASSIST_BASE_URL}/projects/:project_key/tickets`,
  GET_PROJECT_OPEN_TICKETS: `${TOIL_ASSIST_BASE_URL}/projects/:project_key/tickets/open`,
  GET_PROJECT: `${TOIL_ASSIST_BASE_URL}/projects/:project_key`,
  GET_TICKET_RUNBOOK: `${TOIL_ASSIST_BASE_URL}/tickets/:ticket_key/runbook`,
  GET_TICKET: `${TOIL_ASSIST_BASE_URL}/tickets/:ticket_key`,
  APPROVE_REMEDIATION: `${TOIL_ASSIST_BASE_URL}/remediation/:ticket_key/approve`,
  DECLINE_REMEDIATION: `${TOIL_ASSIST_BASE_URL}/remediation/:ticket_key/decline`,
  GET_TICKET_COMMENTS: `${TOIL_ASSIST_BASE_URL}/tickets/:ticket_key/comments`,
  POST_GRAFANA_ALERT: `${TOIL_ASSIST_BASE_URL}/grafana-alert`,
  POST_JIRA_APPROVAL_WEBHOOK: `${TOIL_ASSIST_BASE_URL}/jira-approval-webhook`,
};


export const DashboardAssistUrl = {
  GENERATE_DASHBOARD: `${DASHBOARD_ASSIST_BASE_URL}/generate_dashboard`,
  UPLOAD_DASHBOARD: `${DASHBOARD_ASSIST_BASE_URL}/upload_dashboard`,
  HISTORY: `${DASHBOARD_ASSIST_BASE_URL}/history`,
};

export const DriftAssistUrl = {
  CONNECT_AWS: `${DRIFT_ASSIST_BASE_URL}/api/env/connect`,
  GET_S3_BUCKETS: `${DRIFT_ASSIST_BASE_URL}/api/s3/buckets`,
  GET_STATE_FILES: `${DRIFT_ASSIST_BASE_URL}/api/s3/buckets`,
  ANALYZE_BUCKET: `${DRIFT_ASSIST_BASE_URL}/api/s3/analyze-bucket-state-files`,
  ANALYZE_STATE_FILE_STREAM: `${DRIFT_ASSIST_BASE_URL}/api/s3/analyze-state-file-stream`,
  GENERATE_PDF_REPORT: `${DRIFT_ASSIST_BASE_URL}/api/reports/generate-pdf`,
};


export const RouteUrl = {
  ONBOARDING: {
    DASHBOARD: "/onboarding",
    LOGIN: "/onboarding/login",
    MFA_LOGIN: "/onboarding/mfa-login",
    SIGNUP: "/onboarding/signup",
    SIGNUP_SUCCES: "/onboarding/signup-success",
    FORGOT_PASSWORD: "/onboarding/forgot-password",
    FORGOT_PASSWORD_SUCCESS: "/onboarding/forget-password-success",
    CONFIGURE_MFA: "/onboarding/configure-mfa",
  },

  HOME: {
    DASHBOARD: "/",
    CREATE_PORTPOLIO: "/create-portfolio",
    APPLICATIONS: "/application",
  },

  PROJECTS: {
    DASHBOARD: "/project/:project",
    APPLICATIONS: "/project/:project/application",
    CREATE_APPLICATION: "/project/:project/create-application",
    MEMBERS: "/project/:project/members",
  },

  APPLICATIONS: {
    DASHBOARD: "/project/:project/application/:application",
    WORKFLOW: "/project/:project/application/:application/workflow",
    RESILIENCY_INDEX:
      "/project/:project/application/:application/workflow/resiliency_index",
    CODE_HYGIENCE_STANDARDS:
      "/project/:project/application/:application/workflow/code_hygiene_standards",
    CHAOS_EXPERIMENT:
      "/project/:project/application/:application/workflow/chaos-experiments",
    EXPERIMENT:
      "/project/:project/application/:application/workflow/chaos-experiments/experiments",
    HEALTH_CHECKS:
      "/project/:project/application/:application/workflow/chaos-experiments/health-checks",

    AGENTS:
      "/project/:project/application/:application/workflow/chaos-experiments/agents",
    AGENT_INSTALATION_GUIDE:
      "/project/:project/application/:application/workflow/chaos-experiments/agent-installation-guide",
    DRIFT_ASSIST: "/project/:project/application/:application/workflow/drift-assist",
  },
};

export const excludedFromTrackUrls = [
  RouteUrl.HOME.DASHBOARD,
  RouteUrl.ONBOARDING.LOGIN,
  RouteUrl.ONBOARDING.FORGOT_PASSWORD,
  RouteUrl.ONBOARDING.FORGOT_PASSWORD_SUCCESS,
  RouteUrl.ONBOARDING.MFA_LOGIN,
];
