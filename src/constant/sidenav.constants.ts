import { SidenavList, SidenavType } from "interfaces";

import {
  ApplicationIcon,
  DashboardIcon,
  HomeIcon,
  InsightIcon,
  MembersIcon,
  PartitionIcon,
  PieChartIcon,
  TeamsIcon,
  WorkflowIcon,
} from "assets";

import { RouteUrl } from "./url.constant";

export const SidenavMenu = {
  HOME_PORTFOLIO: { menu: SidenavType.HOME, key: "home_portfolio" },
  HOME_INSIGHTS: { menu: SidenavType.HOME, key: "home_insights" },
  PORTFOLIO_DASHBOARD: {
    menu: SidenavType.PORTFOLIO,
    key: "portfolio_dashboard",
  },
  PORTFOLIO_APPLICATIONS: {
    menu: SidenavType.PORTFOLIO,
    key: "portfolio_applications",
  },
  PORTFOLIO_MEMBERS: { menu: SidenavType.PORTFOLIO, key: "portfolio_members" },
  PORTFOLIO_TEAMS: { menu: SidenavType.PORTFOLIO, key: "portfolio_teams" },
  PORTFOLIO_INSIGHTS: {
    menu: SidenavType.PORTFOLIO,
    key: "portfolio_insights",
  },
  APPLICATIONS_DASHBOARD: {
    menu: SidenavType.APPLICATIONS,
    key: "applications_dashboard",
  },
  APPLICATIONS_WORKFLOW: {
    menu: SidenavType.APPLICATIONS,
    key: "applications_workflow",
  },
  APPLICATIONS_KPI_TARGET: {
    menu: SidenavType.APPLICATIONS,
    key: "applications_kpi_target",
  },
  APPLICATIONS_MEMBERS: {
    menu: SidenavType.APPLICATIONS,
    key: "applications_members",
  },
  APPLICATIONS_TEAMS: {
    menu: SidenavType.APPLICATIONS,
    key: "applications_teams",
  },
  APPLICATIONS_INSIGHTS: {
    menu: SidenavType.APPLICATIONS,
    key: "applications_insights",
  },
  APPLICATIONS_INTEGRATIONS: {
    menu: SidenavType.APPLICATIONS,
    key: "applications_integrations",
  },
};

export const HomeMenu: SidenavList = {
  title: "Home",
  menu: [
    {
      key: SidenavMenu.HOME_PORTFOLIO.key,
      label: "Portfolio",
      icon: HomeIcon,
      route: RouteUrl.HOME.DASHBOARD,
    },
    {
      key: SidenavMenu.HOME_INSIGHTS.key,
      label: "Insights",
      icon: InsightIcon,
      route: RouteUrl.HOME.INSIGHTS,
    },
  ],
};

export const PortfolioMenu: SidenavList = {
  title: "Portfolio",
  menu: [
    {
      key: SidenavMenu.PORTFOLIO_DASHBOARD.key,
      label: "Dashboard",
      icon: DashboardIcon,
      route: RouteUrl.PROJECTS.DASHBOARD,
    },
    {
      key: SidenavMenu.PORTFOLIO_APPLICATIONS.key,
      label: "Applications",
      icon: ApplicationIcon,
      route: RouteUrl.PROJECTS.APPLICATIONS,
    },
    {
      key: SidenavMenu.PORTFOLIO_MEMBERS.key,
      label: "Members",
      icon: MembersIcon,
      route: RouteUrl.PROJECTS.MEMBERS,
    },
    {
      key: SidenavMenu.PORTFOLIO_TEAMS.key,
      label: "Teams",
      icon: TeamsIcon,
      route: RouteUrl.PROJECTS.TEAMS,
    },
    {
      key: SidenavMenu.PORTFOLIO_INSIGHTS.key,
      label: "Insights",
      icon: InsightIcon,
      route: RouteUrl.PROJECTS.INSIGHTS,
    },
  ],
};

export const ApplicationMenu: SidenavList = {
  title: "Application",
  menu: [
    {
      key: SidenavMenu.APPLICATIONS_DASHBOARD.key,
      label: "Dashboard",
      icon: DashboardIcon,
      route: RouteUrl.APPLICATIONS.DASHBOARD,
    },
    {
      key: SidenavMenu.APPLICATIONS_WORKFLOW.key,
      label: "Workflow",
      icon: WorkflowIcon,
      route: RouteUrl.APPLICATIONS.WORKFLOW,
    },
    {
      key: SidenavMenu.APPLICATIONS_KPI_TARGET.key,
      label: "KPI Targets",
      icon: PieChartIcon,
    },
    {
      key: SidenavMenu.APPLICATIONS_MEMBERS.key,
      label: "Members",
      icon: MembersIcon,
    },
    {
      key: SidenavMenu.APPLICATIONS_TEAMS.key,
      label: "Teams",
      icon: TeamsIcon,
    },
    {
      key: SidenavMenu.APPLICATIONS_INSIGHTS.key,
      label: "Insights",
      icon: InsightIcon,
    },
    {
      key: SidenavMenu.APPLICATIONS_INTEGRATIONS.key,
      label: "Integrations",
      icon: PartitionIcon,
    },
  ],
};

export const SidenavMenuMap: Record<string, SidenavList> = {
  home: HomeMenu,
  portfolio: PortfolioMenu,
  applications: ApplicationMenu,
};
