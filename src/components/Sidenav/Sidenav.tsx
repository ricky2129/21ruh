import { Flex } from "antd";
import Sider from "antd/es/layout/Sider";

import { useAppNavigation } from "context";

import { Metrics } from "themes";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { Nav } from "./Nav";
import "./sidernav.styles.scss";

const Sidenav: React.FC = () => {
  const { isSidebarCollapsed } = useAppNavigation();

  return (
    <Sider
      className="sidebar"
      width={Metrics.SIDEBAR_WIDTH}
      collapsible
      collapsed={isSidebarCollapsed}
      collapsedWidth={Metrics.SIDEBAR_COLLAPSED_WIDTH}
      trigger={null}
    >
      <Flex vertical className="sidenav">
        <Header />
        <Nav />
        <Footer />
      </Flex>
    </Sider>
  );
};

export default Sidenav;
