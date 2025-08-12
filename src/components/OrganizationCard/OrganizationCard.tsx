import React from "react";

import {
  CheckOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Divider, Flex, theme } from "antd";

import Organization1 from "assets/organization1.svg";
import Organization2 from "assets/organization2.svg";

import { Button, Text } from "components";

import { Metrics } from "themes";

import "./OrganizationCard.styles.scss";

const { useToken } = theme;

const items = [
  {
    key: "1",
    label: "My <Username>",
    selected: true,
    image: <Organization1 className="selected-organization-image" />,
  },
  {
    key: "2",
    label: "<Organization Name>",
    image: <Organization2 className="selected-organization-image" />,
    selected: false,
  },
];

const OrganizationCard: React.FC = () => {
  const { token } = useToken();

  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  return (
    <Flex vertical style={contentStyle} gap={Metrics.SPACE_LG} className="organzationdropdown-menu-container">
      <Flex vertical gap={0} >
        <Text text="Switch Organization" type="footnote" customClass="switch-organization-head" />
        {items.map((item, index) => (
          <Flex
            key={index}
            gap={Metrics.SPACE_XS}
            align="center"
            className={`organizationdropdown-items ${item.selected && "bold"}`}
          >
            {item.image} {item.label}
            {item.selected && (
              <CheckOutlined className="selectedOrganization-rightclick" />
            )}
          </Flex>
        ))}
      </Flex>
      <Flex vertical gap={Metrics.SPACE_XXS}>
        <Button
          title="Create new organization"
          icon={<PlusOutlined />}
          type="default"
          customClass="createneworganization-button"
          size="middle"
        />
        <Button
          title="Manage Organizations"
          icon={<SettingOutlined />}
          type="default"
          size="middle"
          customClass="createneworganization-button"
        />
      </Flex>
    </Flex>
  );
};

export default OrganizationCard;
