import React from "react";

import { Layout } from "antd";

import { Headnav, Sidenav } from "components";

import "./appLayout.styles.scss";

const { Content } = Layout;

interface LayoutProps {
  children: React.ReactNode;
}
const LayoutComp: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
  return (
    <Layout className="layout">
      <Sidenav />
      <Layout className="layout-right">
        <Headnav />
        <Content className="content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComp;
