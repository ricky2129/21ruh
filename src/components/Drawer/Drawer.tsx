import React from "react";

import { CloseOutlined } from "@ant-design/icons";
import { Drawer as AntdDrawer, Flex } from "antd";

import { Button, IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./drawer.styles.scss";

interface DrawProps {
  title: string;
  subtitle?: string;
  open: boolean;
  submitButtonText?: string;
  loading?: boolean;
  disabled?: boolean;
  hideFooter?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode | string | number;
  onClose?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  width?: number;
}

const Drawer: React.FC<DrawProps> = ({
  title,
  subtitle,
  open = false,
  loading = false,
  submitButtonText,
  disabled = false,
  hideFooter = false,
  children,
  footer = "",
  onClose,
  onSubmit,
  onCancel,
  width = 452,
}: DrawProps) => {
  return (
    <AntdDrawer
      open={open}
      closable={false}
      maskClosable={false}
      title={
        <Flex justify="space-between" align="center">
          <Flex vertical>
            <Text
              text={title}
              type={subtitle ? "cardtitle" : "title"}
              weight="semibold"
            />
            {subtitle && <Text text={subtitle} type="footnote" />}
          </Flex>
          <IconViewer
            Icon={CloseOutlined}
            size={Metrics.SPACE_LG}
            color={Colors.COOL_GRAY_9}
            onClick={onClose}
            customClass="cursor-pointer"
            disabled={loading}
          />
        </Flex>
      }
      footer={
        hideFooter ? null : footer ? (
          footer
        ) : (
          <Flex gap={Metrics.SPACE_MD} justify="end">
            <Button
              title="Cancel"
              onClick={onCancel}
              type="default"
              disabled={loading}
            />
            <Button
              title={submitButtonText || "Submit"}
              onClick={onSubmit}
              type="primary"
              disabled={disabled || loading}
              loading={loading}
            />
          </Flex>
        )
      }
      width={width}
      onClose={onClose}
      push={false}
      className="drawer-container"
    >
      <Flex vertical gap={Metrics.SPACE_XL}>
        {children}
      </Flex>
    </AntdDrawer>
  );
};

export default Drawer;
