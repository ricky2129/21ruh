import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Progress as AntdProgress, Col, Flex, Row, Spin } from "antd";
import classNames from "classnames";
import { GenericIconType } from "interfaces";

import { Progress } from "assets";

import { Button, IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./scanOverview.style.scss";

interface detail {
  label: string;
  value: string | number | React.ReactElement;
}

type ScanStatusType =
  | "notStarted"
  | "inprogress"
  | "completed"
  | "interrupted"
  | "soonStarting";

interface ScanOverviewProps {
  details: detail[];
  scanStatus: ScanStatusType | number;
  restartScan: () => void;
  downloadReport: () => void;
}

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
  inprogress: {
    text: "Inprogress",
    icon: Progress,
    iconColor: Colors.PRIMARY_BLUE,
    textColor: Colors.PRIMARY_BLUE,
    bgColor: Colors.DAYBREAK_BLUE_1,
    borderColor: Colors.PRIMARY_BLUE,
  },
  completed: {
    text: "Completed",
    icon: CheckCircleFilled,
    iconColor: Colors.PRIMARY_GREEN_600,
    textColor: Colors.POLAR_GREEN_8,
    bgColor: Colors.POLAR_GREEN_1,
    borderColor: Colors.PRIMARY_GREEN_600,
  },
  interrupted: {
    text: "Interrupted",
    icon: ExclamationCircleFilled,
    iconColor: Colors.BRIGHT_RED,
    textColor: Colors.DUST_RED_6,
    bgColor: Colors.DUST_RED_1,
    borderColor: Colors.DUST_RED_5,
  },
  notStarted: {
    text: "Not Started",
    icon: SyncOutlined,
    iconColor: Colors.PRIMARY_BLUE,
    textColor: Colors.PRIMARY_BLUE,
    bgColor: Colors.DAYBREAK_BLUE_1,
    borderColor: Colors.PRIMARY_BLUE,
  },
  soonStarting: {
    text: "Not yet started",
    icon: SyncOutlined,
    iconColor: Colors.COOL_GRAY_10,
    textColor: Colors.COOL_GRAY_11,
    bgColor: Colors.COOL_GRAY_4,
    borderColor: Colors.PRIMARY_BLUE,
  },
};

const ScanOverview: React.FC<ScanOverviewProps> = ({
  details,
  scanStatus = "inprogress",
  restartScan,
}) => {
  return (
    <Flex gap={0} vertical>
      <Row
        className={classNames("details-container", {
          "border-all": scanStatus === "notStarted",
        })}
      >
        {details.map((detail, index) => (
          <Col xs={24} sm={12} md={6} key={index} className="detail-text">
            <Text
              color={Colors.COOL_GRAY_7}
              type="footnote"
              weight="semibold"
              text={detail.label}
            />
            <br />
            <Text
              color={Colors.BLACK_1}
              text={detail.value}
              type="bodycopy"
              weight="semibold"
            />
          </Col>
        ))}
        {scanStatus !== "notStarted" && (
          <Col xs={24} sm={12} md={12} className="detail-text">
            <Text
              color={Colors.COOL_GRAY_7}
              type="footnote"
              weight="semibold"
              text="Scan Status"
            />
            <br />
            <Flex align="center" gap={Metrics.SPACE_XXS}>
              <IconViewer
                Icon={ScanStatusMap[scanStatus]?.icon}
                size={15}
                color={ScanStatusMap[scanStatus]?.iconColor}
              />
              <Text
                color={ScanStatusMap[scanStatus]?.textColor}
                text={ScanStatusMap[scanStatus]?.text}
                type="bodycopy"
                weight="semibold"
                style={{ whiteSpace: "nowrap" }}
              />
              {scanStatus === "inprogress" ? (
                <Spin indicator={<LoadingOutlined spin />} />
              ) : typeof scanStatus === "number" ? (
                <AntdProgress
                  percent={scanStatus as number}
                  size={[166, 12]}
                  className="scan-progress-bar"
                />
              ) : (
                ""
              )}
              &nbsp;
              {scanStatus === "interrupted" && (
                <Button
                  title="Re-start Scan"
                  size="small"
                  onClick={restartScan}
                  type="default"
                />
              )}
            </Flex>
          </Col>
        )}
      </Row>
    </Flex>
  );
};

export default ScanOverview;
