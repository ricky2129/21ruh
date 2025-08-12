import React, { ReactNode, useState } from "react";

import { DownloadOutlined } from "@ant-design/icons";
import { Flex, Modal, Select, Switch } from "antd";

import { CloseFullscreenIcon, FullscreenIcon } from "assets";

import { Card, IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./dashboardCard.styles.scss";

interface DashboardCardProps {
  cardTitle: string;
  selectionItems: string[];
  selectPlaceholder?: string;
  GraphComponent: ReactNode;
  TableComponent: ReactNode;
  loading?: boolean;
  onDownload?: () => void;
  onToggleView?: (checked: boolean) => void;
  onSelectionChange: (value: string) => void;
  onFullscreen?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  cardTitle,
  selectPlaceholder = "Select",
  selectionItems,
  GraphComponent,
  TableComponent,
  loading = false,
  onDownload,
  onSelectionChange,
  onFullscreen,
}) => {
  const [isTableView, setIsTableView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardComponent = () => {
    return (
      <>
        <Flex
          vertical
          gap={Metrics.SPACE_LG}
          className="graph-header"
          style={{ paddingBlockEnd: Metrics.SPACE_MD }}
        >
          <Flex align="center" justify="space-between">
            <Text
              text={cardTitle}
              type="cardtitle"
              weight="semibold"
              color={Colors.COOL_GRAY_11_DARK}
            />
            <Flex align="center" gap={Metrics.SPACE_MD}>
              <IconViewer
                Icon={DownloadOutlined}
                size={Metrics.SPACE_MD}
                color={Colors.PRIMARY_BLUE}
                onClick={onDownload}
                customClass="cursor-pointer"
              />
              <Flex gap={Metrics.SPACE_XXS}>
                <Text
                  text="Table view"
                  type="footnote"
                  color={Colors.HEADNAV_TEXT_GREY}
                />
                <Switch
                  checked={isTableView}
                  onChange={(checked) => {
                    setIsTableView(checked);
                  }}
                />
              </Flex>
              <IconViewer
                Icon={isModalOpen ? CloseFullscreenIcon : FullscreenIcon}
                size={Metrics.SPACE_MD}
                color={Colors.PRIMARY_BLUE}
                onClick={() => {
                  setIsModalOpen(!isModalOpen);
                  onFullscreen();
                }}
                customClass="cursor-pointer"
              />
            </Flex>
          </Flex>

          <Select
            options={selectionItems.map((data) => ({ key: data, value: data }))}
            defaultValue={selectionItems[0]}
            placeholder={selectPlaceholder}
            onChange={(data) => onSelectionChange(data)}
            className="selection-selector"
          />
        </Flex>

        <Flex style={{ overflowX: "hidden" }}>
          {isTableView ? TableComponent : GraphComponent}
        </Flex>
      </>
    );
  };

  return (
    <>
      <Card loading={loading} height={450} borderRadius={Metrics.SPACE_XS}>
        {cardComponent()}
      </Card>
      <Modal
        centered
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width={850}
        footer={null}
        closable={false}
      >
        {cardComponent()}
      </Modal>
    </>
  );
};

export default DashboardCard;
