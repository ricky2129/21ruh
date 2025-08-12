import { GetProp, MenuProps } from "antd";

export const SidenavType = {
  HOME: "home",
  PORTFOLIO: "portfolio",
  APPLICATIONS: "applications",
};

export interface SidenavListItem {
  key: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  route?: string;
}

export interface SidenavList {
  title: string;
  menu: SidenavListItem[];
}

export type MenuItem = GetProp<MenuProps, "items">[number];

export interface SidebarMenu {
  title: string;
  menu: MenuItem[];
}
