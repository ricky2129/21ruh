import React from "react";

import { CaretRightOutlined, LoadingOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";

import { BarChart } from "assets";

import { Button, IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./runScans.styles.scss";

interface RunScansProps {
  text?: string;
  runningText?: string;
  buttonText?: string;
  loading: boolean;
  onRunScans: () => void;
}

const RunScans: React.FC<RunScansProps> = ({
  text = "Please run the scan to get the metrics",
  runningText = "Scanning in Progress...",
  buttonText = "Run Scans",
  loading,
  onRunScans,
}) => {
  return (
    <Flex className="run-scans-container" align="center" justify="center">
      <Flex vertical gap={Metrics.SPACE_XL} align="center">
        <Flex vertical gap={Metrics.SPACE_XS} align="center">
          <IconViewer
            Icon={BarChart}
            color={Colors.COOL_GRAY_6}
            height={40}
            width={40}
          />
          <Text
            text={text}
            color={Colors.COOL_GRAY_6}
            weight="semibold"
            type="bodycopy"
          />
        </Flex>
        {loading ? (
          <Flex
            gap={Metrics.SPACE_XS}
            align="center"
            className="loading-container"
          >
            <Spin indicator={<LoadingOutlined spin />} />
            <Text
              text={runningText}
              type="bodycopy"
              color={Colors.SECONDARY_BLUE_5}
            />
          </Flex>
        ) : (
          <Button
            title={buttonText}
            onClick={onRunScans}
            type="primary"
            size="middle"
            customClass="run-scans-button"
            icon={
              <IconViewer
                Icon={CaretRightOutlined}
                width={10}
                color={Colors.WHITE}
              />
            }
          />
        )}
      </Flex>
    </Flex>
  );
};

export default RunScans;
