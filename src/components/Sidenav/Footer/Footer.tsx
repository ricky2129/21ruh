import React from "react";
import { useGetUserProfile } from "react-query";

import { UserOutlined } from "@ant-design/icons";
import { ConfigProvider, Divider, Flex, GetProp, Menu, MenuProps } from "antd";

import { LogoutIcon, ThemeIcon, UserProfileIcon } from "assets";
import SettingsIcon from "assets/settings.svg";

import { IconViewer, Text } from "components";

import { useAppNavigation, useAuth } from "context";

import { Colors, Metrics } from "themes";

import { sidenavTheme } from "../sidenav.theme";
import "./footer.styles.scss";

type MenuItem = GetProp<MenuProps, "items">[number];

const userManagementMenu: MenuItem[] = [
  {
    key: "1",
    icon: (
      <IconViewer
        Icon={UserOutlined}
        size={Metrics.SIDEBAR_ICON_SIZE}
        color={Colors.COOL_GRAY_11}
        customClass="ant-menu-item-icon"
      />
    ),
    title: "",
    label: "User management",
    children: [
      {
        key: "1-1",
        label: "People",
      },
      {
        key: "1-2",
        label: "Teams",
      },
    ],
  },
];

const settingsMenu: MenuItem[] = [
  {
    key: "1",
    icon: (
      <IconViewer
        Icon={SettingsIcon}
        size={Metrics.SIDEBAR_ICON_SIZE}
        color={Colors.TRANPARENT}
        customClass="ant-menu-item-icon footer-menu-icon"
      />
    ),
    label: "Settings",
    title: "",
    children: [
      {
        key: "1-1",
        label: "Account",
      },
      {
        key: "1-2",
        label: "Notifications",
      },
    ],
  },
];

const Footer: React.FC = () => {
  const { logout, isLoading } = useAuth();
  const { isSidebarCollapsed } = useAppNavigation();
  const userProfileQuery = useGetUserProfile();

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            ...sidenavTheme.components.Menu,
            colorText: Colors.COOL_GRAY_11,
            itemMarginInline: 0,
            itemMarginBlock: 0,
          },
        },
      }}
    >
      <Flex vertical gap={Metrics.SPACE_XS} className="sidenav-footer-wrapper">
        <Flex className="sidenav-divider">
          <Divider className="divider" />
        </Flex>

        <Menu
          className="sidenav-footer"
          mode="inline"
          items={userManagementMenu}
          inlineIndent={Metrics.SPACE_MD}
        />

        <Menu
          className="sidenav-footer"
          mode="inline"
          items={settingsMenu}
          inlineIndent={Metrics.SPACE_MD}
        />

        {isSidebarCollapsed ? (
          <Flex gap={Metrics.SPACE_SM} className="footer-user-details">
            <IconViewer Icon={UserProfileIcon} size={24} />
          </Flex>
        ) : (
          <Flex gap={Metrics.SPACE_SM} className="footer-user-details">
            <Flex gap={Metrics.SPACE_XS} align="center" style={{ height: 24 }}>
              <IconViewer Icon={UserProfileIcon} size={24} />
              <Flex vertical>
                <Text
                  text={`${userProfileQuery?.data?.first_name} ${userProfileQuery?.data?.last_name}`}
                  weight="semibold"
                  title={`${userProfileQuery?.data?.first_name} ${userProfileQuery?.data?.last_name}`}
                  customClass="footer-user-name"
                />
                <Text
                  text="Admin"
                  type="footnote"
                  weight="semibold"
                  customClass="footer-user-role"
                />
              </Flex>
            </Flex>
            <Flex
              align="center"
              gap={Metrics.SPACE_SM}
              style={{ marginLeft: "auto" }}
            >
              <IconViewer
                Icon={ThemeIcon}
                size={16}
                color={Colors.COOL_GRAY_11}
              />
              <IconViewer
                Icon={LogoutIcon}
                size={16}
                color={Colors.BRIGHT_RED}
                customClass="cursor-pointer"
                onClick={() => logout()}
                disabled={isLoading}
              />
            </Flex>
          </Flex>
        )}
      </Flex>
    </ConfigProvider>
  );
};

export default Footer;
