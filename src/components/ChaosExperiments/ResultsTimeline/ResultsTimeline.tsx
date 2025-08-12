import React, { useState } from "react";

import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  RightOutlined,
} from "@ant-design/icons";
import { Card, Descriptions, Flex } from "antd";
import { GenericIconType, GraphNodes } from "interfaces";

import { Progress } from "assets";

import {
  Button,
  Drawer,
  IconViewer,
  ServerUtilizationGraph,
  Text,
} from "components";

import { Colors, Metrics } from "themes";

import "./resultsTimeline.style.scss";

interface ResultTimelineProps {
  graph_nodes: GraphNodes[];
  handleRerun?: () => void;
}

type ScanStatusType =
  | "Successful"
  | "NotStarted"
  | "Halted"
  | "Active"
  | "HaltRequested";

const ScanStatusMap: {
  [K in ScanStatusType]: {
    text: string;
    icon: GenericIconType;
    iconColor: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  };
} = {
  NotStarted: {
    text: "Not started",
    icon: Progress,
    iconColor: Colors.COOL_GRAY_11,
    textColor: Colors.WHITE,
    bgColor: Colors.COOL_GRAY_11,
    borderColor: Colors.COOL_GRAY_11,
  },
  Successful: {
    text: "Successful",
    icon: CheckCircleFilled,
    iconColor: Colors.PRIMARY_GREEN_600,
    textColor: Colors.POLAR_GREEN_8,
    bgColor: Colors.POLAR_GREEN_1,
    borderColor: Colors.PRIMARY_GREEN_600,
  },
  Active: {
    text: "In progress",
    icon: Progress,
    iconColor: Colors.PRIMARY_BLUE,
    textColor: Colors.PRIMARY_BLUE,
    bgColor: Colors.DAYBREAK_BLUE_1,
    borderColor: Colors.PRIMARY_BLUE,
  },
  Halted: {
    text: "Interrupted",
    icon: ExclamationCircleFilled,
    iconColor: Colors.BRIGHT_RED,
    textColor: Colors.DUST_RED_6,
    bgColor: Colors.DUST_RED_1,
    borderColor: Colors.DUST_RED_5,
  },
  HaltRequested: {
    text: "Interrupted",
    icon: ExclamationCircleFilled,
    iconColor: Colors.BRIGHT_RED,
    textColor: Colors.DUST_RED_6,
    bgColor: Colors.DUST_RED_1,
    borderColor: Colors.DUST_RED_5,
  },
};

interface DescriptionData {
  label: string;
  dataIndex:
    | "time"
    | "lifecycle"
    | "stepDescription"
    | "name"
    | "target_name"
    | "target_type"
    | "target_percentage_on_agent"
    | "capicity"
    | "cores"
    | "start_time"
    | "end_time"
    | "observations"
    | "metric_references";
  renderLabel?: (
    value: string | number | React.ReactElement | boolean,
    object: GraphNodes,
  ) => React.ReactElement | string | number | boolean;
  render?: (
    value: string | number | React.ReactElement | boolean,
  ) => React.ReactElement | string | number | boolean;
}

const descriptionData: DescriptionData[] = [
  {
    label: "Type",
    dataIndex: "target_name",
    render: (value: string) =>
      `${value?.charAt(0)?.toUpperCase()?.concat(value?.slice(1))}`,
  },
  {
    label: "Status",
    dataIndex: "lifecycle",
    render: (value: string) => {
      console.log(ScanStatusMap[value]);
      return (
        <Text
          weight="semibold"
          type="bodycopy"
          color={
            ScanStatusMap[value]?.textColor === "#fff"
              ? ScanStatusMap[value]?.iconColor
              : ScanStatusMap[value]?.textColor
          }
          text={ScanStatusMap[value]?.text}
        />
      );
    },
  },
  {
    label: "Target Type",
    dataIndex: "target_type",
  },
  {
    label: "Capacity",
    dataIndex: "target_percentage_on_agent",
    renderLabel: (_, object: GraphNodes) => {
      const targetName = object?.target_name?.toString();

      return `${targetName?.charAt(0)?.toUpperCase() + targetName?.slice(1)} capacity`;
    },
  },
  {
    label: "Length",
    dataIndex: "time",
    render: (value: number) => `${value / 5} minutes (${value} seconds)`,
  },
  {
    label: "Initiated Time",
    dataIndex: "start_time",
    render: (value: string) => {
      const date = new Date(value);
      return isNaN(date.getTime()) ? "---" : date.toLocaleString();
    },
  },
  {
    label: "End Time",
    dataIndex: "end_time",
    render: (value: string) => {
      const date = new Date(value);
      return isNaN(date.getTime()) ? "---" : date.toLocaleString();
    },
  },
];

const ResultsTimeline: React.FC<ResultTimelineProps> = ({
  graph_nodes,
  handleRerun,
}) => {
  const [openInsightDrawer, setOpenInsightDrawer] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(null);

  return (
    <Flex
      vertical
      gap={Metrics.SPACE_SM}
      className="results-timeline-container"
    >
      <Flex
        align="center"
        gap={Metrics.SPACE_XS}
        className="result-timeline-steps"
      >
        {graph_nodes?.map((step, index) => {
          const width = Math.min(200, step?.time);
          return (
            <Flex vertical gap={Metrics.SPACE_SM} key={index}>
              <Card
                style={{
                  visibility:
                    typeof step.target_name === "string" ? "visible" : "hidden",
                }}
                title={
                  <Flex justify="space-between">
                    {step?.target_name?.toString()}
                    <IconViewer
                      Icon={RightOutlined}
                      width={6}
                      height={10}
                      customClass="cursor-pointer"
                      onClick={() => {
                        setOpenInsightDrawer(true);
                        setSelectedIndex(index);
                      }}
                    />
                  </Flex>
                }
                className="scan-status-card"
                bordered={false}
              >
                <Flex vertical gap={Metrics.SPACE_SM}>
                  <Flex
                    style={{
                      backgroundColor: ScanStatusMap[step.lifecycle]?.bgColor,
                      border: `1px solid ${ScanStatusMap[step.lifecycle]?.borderColor}`,
                    }}
                    className="scan-status-text"
                    vertical
                    gap={0}
                  >
                    <Text
                      type="footnote"
                      weight="bold"
                      text={`${step?.target}%`}
                      color={ScanStatusMap[step.lifecycle]?.textColor}
                    />
                    <Text
                      type="footnote"
                      text="of selected targets"
                      color={ScanStatusMap[step.lifecycle]?.textColor}
                    />
                  </Flex>
                  <Text
                    type="footnote"
                    text={`${Math.floor(step?.time / 60)} Minutes`}
                    color={Colors.COOL_GRAY_12}
                  />
                </Flex>
              </Card>

              <Flex vertical>
                <Flex align="center">
                  {typeof step.target !== "object" && (
                    <IconViewer
                      Icon={ScanStatusMap[step.lifecycle]?.icon}
                      color={ScanStatusMap[step.lifecycle]?.iconColor}
                      size={32}
                    />
                  )}{" "}
                  &nbsp;
                  <div
                    style={{
                      height: "2px",
                      width: typeof step.target !== "object" ? width : "100%",
                      backgroundColor: ScanStatusMap[step.lifecycle]?.iconColor,
                      marginTop: typeof step.target === "object" ? "2rem" : "0",
                    }}
                  >
                    {" "}
                  </div>
                </Flex>
                {typeof step.target === "object" && (
                  <Flex className="time-container">{step.time} seconds</Flex>
                )}
              </Flex>
            </Flex>
          );
        })}
      </Flex>
      <Drawer
        open={openInsightDrawer}
        onClose={() => setOpenInsightDrawer(false)}
        title={
          typeof graph_nodes?.[selectedIndex]?.target_name === "string" &&
          graph_nodes?.[selectedIndex]?.target_name
        }
        footer={
          <Flex justify="flex-end" gap={Metrics.SPACE_XS}>
            <Button
              type="default"
              title="Close"
              onClick={() => setOpenInsightDrawer(false)}
            />
            <Button type="primary" title="Rerun" onClick={handleRerun} />
          </Flex>
        }
      >
        <Descriptions
          items={descriptionData.map((data) => {
            return {
              label: data.renderLabel
                ? data.renderLabel(
                    graph_nodes?.[selectedIndex]?.[data?.dataIndex],
                    graph_nodes?.[selectedIndex],
                  )
                : data.label,
              children: data.render
                ? data.render(graph_nodes[selectedIndex]?.[data.dataIndex])
                : graph_nodes?.[selectedIndex]?.[data.dataIndex],
            };
          })}
          layout="vertical"
          column={2}
          style={{ width: "100%", justifyContent: "space-between" }}
          size="middle"
          labelStyle={{ fontWeight: 600 }}
          contentStyle={{ fontWeight: 600 }}
        />
        {graph_nodes?.[selectedIndex / 2]?.metric?.metric_data &&
        graph_nodes?.[selectedIndex / 2]?.metric?.metric_data?.length ? (
          <Flex vertical gap={Metrics.SPACE_XS}>
            <Flex style={{ width: "100%", overflow: "hidden" }}>
              {openInsightDrawer && (
                <ServerUtilizationGraph
                  metric_data={
                    graph_nodes?.[selectedIndex / 2]?.metric?.metric_data
                  }
                />
              )}
            </Flex>
          </Flex>
        ) : (
          <></>
        )}

        <Flex vertical gap={Metrics.SPACE_XS}>
          <Text text="Executions" type="cardtitle" weight="semibold" />
          <Flex
            align="center"
            justify="space-between"
            className="execution-container"
          >
            <Flex gap={Metrics.SPACE_SM}>
              <span className="circle-green"> </span>
              <Text text={graph_nodes?.[selectedIndex]?.agent_name} />
            </Flex>
            <Text
              text={
                graph_nodes?.[selectedIndex]?.agent_version
                  ? `Gremlin v${graph_nodes?.[selectedIndex]?.agent_version}`
                  : ""
              }
              color={Colors.COOL_GRAY_2}
            />
          </Flex>
        </Flex>
      </Drawer>
    </Flex>
  );
};

export default ResultsTimeline;
