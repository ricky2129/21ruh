import React from "react";
import { Outlet } from "react-router-dom";

import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";

import DeloitteLogo from "assets/deloitte-logo.svg";
// import ResuiteLogo from "assets/resuite-logo.svg";
import { SresuiteLogo } from "assets";

import { IconViewer } from "components";

import "./onboarding.styles.scss";

const { Header } = Layout;

export const Onboarding: React.FC = () => {
  return (
    <Layout className="onboarding">
      <Header className="header">
        <IconViewer Icon={SresuiteLogo} height={24} width={112} />
        <IconViewer Icon={DeloitteLogo} height={22} width={112} />
      </Header>
      <Content className="content">
        <Outlet />
      </Content>
    </Layout>
  );
};
