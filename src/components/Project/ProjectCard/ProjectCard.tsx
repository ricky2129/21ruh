import React, { useState } from "react";
import { MoreOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { ConfigProvider, Flex, Tag, Dropdown, Menu, message, Modal } from "antd";
import { RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { Project, ProjectVisibility } from "interfaces";
import { InternalIcon, LockIcon } from "assets";
import ApplicationsIcon from "assets/applications-icon.svg";
import { Button, Card, IconViewer, Text } from "components";
import { Colors, Metrics } from "themes";
import "./projectCard.styles.scss";
import useProjectService from "services/project.service";
import EditProject from "./editProjectModal";

const TagVisibilityMap: Record<
  ProjectVisibility,
  {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
  }
> = {
  public: { icon: LockIcon, label: "Public" },
  private: { icon: LockIcon, label: "Private" },
  internal: { icon: InternalIcon, label: "Internal" },
};

interface ProjectCardProps {
  data: Project;
  loading?: boolean;
  onClickFavorite?: () => void;
  onDelete?: (id: number | string) => void;
  onProjectUpdate?: (updated: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  data,
  loading,
  onClickFavorite = () => {},
  onDelete = () => {},
  onProjectUpdate = () => {},
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { deleteProject } = useProjectService();
  const is_favorite = Math.random() > 0.5 ? true : false;

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: "Delete Portfolio",
      content: `Are you sure you want to delete "${data.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await deleteProject(data.id.toString());
          message.success("Portfolio deleted successfully");
          onDelete(data.id);
        } catch (error) {
          message.error("Failed to delete portfolio");
        }
      },
      onCancel() {},
    });
  };

  const handleEditModalClose = () => setIsEditModalOpen(false);

  const handleEditSuccess = (updatedProject: Project) => {
    setIsEditModalOpen(false);
    onProjectUpdate(updatedProject);
  };

  const handleMenuClick = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    if (key === "edit") {
      setIsEditModalOpen(true);
    } else if (key === "delete") {
      confirmDelete(domEvent);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="edit">Edit</Menu.Item>
      <Menu.Item key="delete">Delete</Menu.Item>
    </Menu>
  );

  return (
    <>
      <Card
        loading={loading}
        hoverable={true}
        flexGap={Metrics.SPACE_XS}
        customClass="project-card"
        onClick={() =>
          window.location.assign(
            resolveUrlParams(RouteUrl.PROJECTS.APPLICATIONS, {
              project: data.id.toString(),
            })
          )
        }
      >
        <div
          className="resiliency"
          style={{ backgroundColor: Colors.PRIMARY_GREEN_600 }}
        ></div>
        <Flex justify="space-between">
          <ConfigProvider
            theme={{
              components: {
                Tag: {
                  borderRadiusSM: 50,
                  paddingXXS: Metrics.SPACE_XXS,
                  colorText: Colors.COOL_GRAY_6,
                },
              },
            }}
          >
            <Tag
              icon={
                <IconViewer
                  Icon={
                    TagVisibilityMap[data.visibility?.toLocaleLowerCase()]?.icon
                  }
                  color={Colors.COOL_GRAY_6}
                  size={14}
                  customClass="anticon"
                />
              }
            >
              {TagVisibilityMap[data?.visibility?.toLocaleLowerCase()]?.label}
            </Tag>
          </ConfigProvider>
          {!isEditModalOpen && (
            <Dropdown
              overlay={menu}
              trigger={['click']}
              onClick={e => e.stopPropagation()}
              destroyPopupOnHide
            >
              <span onClick={e => e.stopPropagation()}>
                <IconViewer
                  Icon={MoreOutlined}
                  size={Metrics.SPACE_XL}
                  customClass="cursor-pointer"
                />
              </span>
            </Dropdown>
          )}
        </Flex>
        <Flex gap={6} vertical>
          <Text type="subtitle" weight="semibold" text={data?.name} />
          {/* <Text type="footnote" text={data?.description} customClass="team" /> */}
        </Flex>
        <Flex className="project-card-footer">
          <Flex gap={4} align="center">
            <IconViewer
              Icon={ApplicationsIcon}
              size={Metrics.SPACE_XL}
              color={Colors.COOL_GRAY_11_DARK}
            />
            <Text type="cardtitle" text={data?.count || 0} />
          </Flex>
          <ConfigProvider wave={{ disabled: true }}>
            <Button
              type="default"
              customClass="favorite-button"
              icon={
                is_favorite ? (
                  <IconViewer Icon={StarFilled} size={Metrics.SPACE_XL} />
                ) : (
                  <IconViewer Icon={StarOutlined} size={Metrics.SPACE_XL} />
                )
              }
              onClick={onClickFavorite}
            />
          </ConfigProvider>
        </Flex>
      </Card>
      <EditProject
        visible={isEditModalOpen}
        onCancel={handleEditModalClose}
        onSuccess={handleEditSuccess}
        project={data}
      />
    </>
  );
};

export default ProjectCard;
