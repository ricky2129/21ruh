import React from "react";

import {
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { Flex, Tooltip } from "antd";
import { GenericIconType } from "interfaces";

import { DeleteIcon } from "assets";

import { Button, IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./integrationManager.style.scss";

interface Integration {
  id: number;
  name: string;
}
interface IntegrationManagerProps {
  name: string;
  description?: string;
  addNewText?: string;
  icon: GenericIconType;
  multipleConnect?: boolean;
  integrations: Integration[];
  disableAction?: boolean;
  info?: string | React.ReactElement;
  onClickAddNew: () => void;
  onEdit: (id: number, record?: Integration, index?: number) => void;
  onDelete?: (id: number, record?: Integration, index?: number) => void;
  onDeleteAll?: () => void;
}

const IntegrationManager: React.FC<IntegrationManagerProps> = ({
  name,
  description,
  icon,
  integrations,
  multipleConnect,
  addNewText = "",
  disableAction,
  info = "",
  onClickAddNew,
  onEdit,
  onDelete,
}) => {
  return (
    <Flex
      className="integration-manager-container"
      vertical
      gap={Metrics.SPACE_MD}
      onClick={() => {
        if (integrations?.length > 0) return;
        onClickAddNew();
      }}
      style={{
        cursor: integrations?.length > 0 ? "default" : "pointer",
      }}
    >
      <Flex justify="space-between" align="center">
        <Flex gap={Metrics.SPACE_SM} style={{ height: "100%" }}>
          <Flex
            className="integration-icon"
            align="center"
            gap={Metrics.SPACE_MD}
          >
            <IconViewer
              Icon={icon}
              width={24}
              height={24}
              color={Colors.COOL_GRAY_12}
            />
          </Flex>

          <Flex vertical justify={description ? "space-between" : "center"}>
            <Flex align="center" gap={Metrics.SPACE_SM}>
              <Text
                type="cardtitle"
                weight="semibold"
                color={Colors.COOL_GRAY_12}
                text={name}
              />
              <Tooltip title={info} placement="topRight">
                <IconViewer
                  color={Colors.COOL_GRAY_7}
                  width={16}
                  height={16}
                  Icon={InfoCircleOutlined}
                />
              </Tooltip>
            </Flex>
            {description && (
              <Text
                type="footnote"
                text={description}
                color={Colors.COOL_GRAY_6}
              />
            )}
          </Flex>
        </Flex>

        {((multipleConnect && integrations?.length === 0) ||
          (!multipleConnect && integrations?.length === undefined)) && (
          <IconViewer Icon={PlusSquareOutlined} color={Colors.COOL_GRAY_11} size={20} />
        )}
      </Flex>
      <Flex vertical gap={Metrics.SPACE_XS}>
        {integrations?.map((integration, index) => (
          <Flex
            className="integration-item"
            align="center"
            justify="space-between"
          >
            <Flex vertical justify="space-between">
              <Text
                type="cardtitle"
                weight="semibold"
                text={integration.name}
              />
              <Text
                type="footnote"
                weight="semibold"
                color={Colors.COOL_GRAY_6}
                text={integration.id}
              />
            </Flex>
            <Flex gap={Metrics.SPACE_SM} align="center">
              <IconViewer
                Icon={EditOutlined}
                size={20}
                color={Colors.COOL_GRAY_12}
                customClass="cursor-pointer"
                disabled={disableAction}
                onClick={() => onEdit(integration.id, integration, index)}
              />
              <IconViewer
                Icon={DeleteIcon}
                width={20}
                height={20}
                color={Colors.COOL_GRAY_12}
                customClass="cursor-pointer"
                disabled={disableAction}
                onClick={() => onDelete(integration.id, integration, index)}
              />
            </Flex>
          </Flex>
        ))}
      </Flex>
      {integrations?.length > 0 && multipleConnect && (
        <Button
          type="link"
          title={`Add New ${addNewText}`}
          icon={<IconViewer Icon={PlusOutlined} color={Colors.PRIMARY_BLUE} />}
          customClass="add-new-btn semibold"
          onClick={onClickAddNew}
        />
      )}
    </Flex>
  );
};

export default IntegrationManager;
