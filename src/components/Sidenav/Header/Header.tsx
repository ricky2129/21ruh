import { Flex } from "antd";

import { CloseCrossIcon, MenuIcon, ResuiteLogo, SresuiteLogo } from "assets";

import { Button, IconViewer } from "components";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./header.styles.scss";

const Header: React.FC = () => {
  const { isSidebarCollapsed, setSidebarCollapsed } = useAppNavigation();

  return (
    <>
      {isSidebarCollapsed ? (
        <Flex justify="center" align="center" className="sidenav-header">
          <Button
            type="icon"
            icon={
              <IconViewer
                Icon={MenuIcon}
                size={Metrics.SPACE_XL}
                color={Colors.COOL_GRAY_9}
              />
            }
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          />
        </Flex>
      ) : (
        <Flex justify="space-between" align="center" className="sidenav-header">
          <IconViewer Icon={SresuiteLogo} height={24} width={112} />
          <Button
            type="icon"
            icon={
              <IconViewer
                Icon={CloseCrossIcon}
                size={Metrics.SPACE_MD}
                customClass="close-cross"
              />
            }
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          />
        </Flex>
      )}
    </>
  );
};

export default Header;
