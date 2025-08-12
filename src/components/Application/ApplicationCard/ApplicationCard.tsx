import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StarFilled, StarOutlined, MoreOutlined } from "@ant-design/icons";
import { ConfigProvider, Flex, Dropdown, Button as AntButton, Modal, message } from "antd";
import { RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { Application } from "interfaces";
import { useApplicationService } from "services";
import {
  CodescanIcon,
  DiagnosticsIcon,
  ExperimentIcon,
  PipelineIcon,
} from "assets";
import { Button, Card, IconViewer, Text } from "components";
import { Colors, Metrics } from "themes";
import "./applicationCard.styles.scss";

interface ApplicationCardProps {
  data: Application;
  loading: boolean;
  onEdit?: (application: Application) => void;
  onDelete?: (id: string) => void;
  onClickFavorite?: () => void;
}

const serviceMenuMap = {
  Infrastructure: {
    name: "Diagnostics",
    desc: "Continuous Resiliency",
    icon: DiagnosticsIcon,
  },
  Repositories: {
    name: "Code Hygiene",
    desc: "Code level Resiliency posture",
    icon: CodescanIcon,
  },
  Pipelines: {
    name: "Pipeline Repositories",
    desc: "Pipeline",
    icon: PipelineIcon,
  },
  Experiments: {
    name: "Chaos Experiments",
    desc: "Validate Resiliency",
    icon: ExperimentIcon,
  },
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  data,
  loading,
  onClickFavorite = () => {},
  onEdit,
  onDelete,
}: ApplicationCardProps) => {
  const navigate = useNavigate();
  const params = useParams();
  const { deleteApplication } = useApplicationService();

  const navmenu = useMemo(() => {
    const services = data?.services?.map((s) => s.name) || [];
    return services;
  }, [data]);

  const handleDelete = async () => {
  Modal.confirm({
    title: "Delete Application",
    content: `Are you sure you want to delete "${data.name}"?`,
    okText: "Delete",
    okType: "danger",
    cancelText: "Cancel",
    async onOk() {
      try {
        await deleteApplication(data.id.toString());
        message.success("Application deleted successfully");
        if (onDelete) {
          onDelete(data.id.toString()); 
        }
      } catch (error) {
        message.error("Failed to delete application");
      }
    },
    onCancel() {},
  });
};

  const menuItems = [
    {
      key: "edit",
      label: "Edit",
    },
    {
      key: "delete",
      label: "Delete",
    },
  ];

  return (
    <Card
      hoverable
      loading={loading}
      flexGap={Metrics.SPACE_XS}
      customClass="application-card"
      onClick={() =>
        navigate(
          resolveUrlParams(RouteUrl.APPLICATIONS.WORKFLOW, {
            application: data.id.toString(),
            project: params?.project,
          }),
        )
      }
    >
      <div className="application-card-menu">
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === "edit") {
                onEdit?.(data);
              } else if (key === "delete") {
                handleDelete();
              }
            },
          }}
          trigger={['click']}
          onClick={e => e.stopPropagation()}
        >
          <AntButton
            type="text"
            icon={<MoreOutlined style={{ fontSize: 20 }} />}
            className="ellipsis-menu"
          />
        </Dropdown>
      </div>

      <div
        className="resiliency"
        style={{ backgroundColor: Colors.PRIMARY_GREEN_600 }}
      ></div>

      <Flex gap={6} vertical>
        <Text type="subtitle" weight="semibold" text={data?.name} />
        <Text
          type="footnote"
          text={`Tags: ${data?.tags?.map((tag) => tag?.key).join(" ")}`}
          color={Colors.COOL_GRAY_6}
          customClass="team"
        />
      </Flex>

      <Flex
        gap={Metrics.SPACE_XL}
        className="application-card-footer"
        justify="space-between"
      >
        <Flex align="center" gap={Metrics.SPACE_MD}>
          {navmenu?.map((nav, index) => (
            <IconViewer
              Icon={serviceMenuMap[nav].icon}
              size={20}
              key={index}
              color={Colors.PRIMARY_GREEN_600}
            />
          ))}
        </Flex>
        <Flex align="center" gap={Metrics.SPACE_XS}>
          <ConfigProvider wave={{ disabled: true }}>
            <Button
              type="default"
              customClass="favorite-button"
              icon={
                Math.random() > 0.5 ? (
                  <IconViewer Icon={StarFilled} size={Metrics.SPACE_XL} />
                ) : (
                  <IconViewer Icon={StarOutlined} size={Metrics.SPACE_XL} />
                )
              }
              onClick={onClickFavorite}
            />
          </ConfigProvider>
        </Flex>
      </Flex>
    </Card>
  );
};

export default ApplicationCard;
