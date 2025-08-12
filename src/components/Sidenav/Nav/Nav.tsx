import { ConfigProvider, Flex, Menu } from "antd";

import { Text } from "components";

import { useAppNavigation } from "context";

import { Metrics } from "themes";

import { sidenavTheme } from "../sidenav.theme";
import "./nav.styles.scss";

const Nav: React.FC = () => {
  const { sidenavMenu, isSidebarCollapsed, selectedMenuKey, onNavigate } =
    useAppNavigation();

  return (
    <ConfigProvider theme={sidenavTheme}>
      <Flex vertical className="sidenav-nav-wrapper">
        {!isSidebarCollapsed && (
          <Flex align="center" className="sidenav-title">
            <Text text={sidenavMenu.title} type="cardtitle" weight="semibold" />
          </Flex>
        )}

        <Menu
          className="sidenav-nav"
          selectedKeys={[selectedMenuKey]}
          mode="inline"
          items={sidenavMenu.menu}
          inlineIndent={Metrics.SPACE_MD}
          onClick={({ key }) => {
            if (key === selectedMenuKey) return;
            onNavigate(key);
          }}
        />
      </Flex>
    </ConfigProvider>
  );
};

export default Nav;
