import { useReducer, useState } from "react";

import { DownloadOutlined } from "@ant-design/icons";
import { Flex, Modal, Progress, Table } from "antd";

import { CloseFullscreenIcon, ExportIcon, FullscreenIcon } from "assets";

import { Drawer, IconViewer, RecommendationDrawer, Text } from "components";

import { Colors, Metrics } from "themes";

const OptimizationTypeMap: Record<string, string> = {
  LeastCost: "Optimize for cost",
  LeastChange: "Optimize for minimal changes",
  BestAZRecovery: "Optimize for Availability Zone RPO/RTO",
  LeastErrors: "Optimize for cost",
  BestAttainable: "",
  BestRegionRecovery: "Optimize for region RTO/RPO",
};

const getStrokeColor = (score: number) => {
  if (score < 20) {
    return `${Colors.BRIGHT_RED}`;
  } else if (score <= 60) {
    return `${Colors.BRIGHT_ORANGE}`;
  } else {
    return `${Colors.PRIMARY_GREEN_600}`;
  }
};

type RecommendationDrawerState = {
  title: string;
  open: boolean;
  data: {
    recommendationId: number;
    envName: string;
    description: string;
    cost: number;
    optimizationType: {
      changes: number;
      type: string;
    };
    recommendationStatus: "NotImplemented" | "Implemented";
    changesRequired: string[];
  };
};

interface AppRecommendationTableProps {
  isLoading: boolean;
  data: {
    key: number;
    envName: string;
    resourceName: string;
    reliabilityScore: string | number;
    description: string;
    cost: string | number;
    recommended_optimization: {
      changes: number;
      type: string;
    };
    changes_required: string[];
  }[];
}

const AppRecommendationTable: React.FC<AppRecommendationTableProps> = ({
  isLoading,
  data,
}) => {
  const columns = [
    {
      title: "Environment Name",
      dataIndex: "envName",
      key: "envName",
      width: "25%",
      render: (name: string) => (
        <Text text={name} type="footnote" weight="regular" />
      ),
    },
    {
      title: "Resources Name",
      dataIndex: "resourceName",
      key: "resourceName",
      width: "25%",
      render: (name: string) => (
        <Text text={name} type="footnote" weight="regular" />
      ),
    },
    {
      title: "Reliability Score",
      dataIndex: "reliabilityScore",
      key: "reliabilityScore",
      width: "25%",
      render: (score: number) => (
        <Flex style={{ width: 100 }}>
          <Progress
            percent={score}
            size="small"
            strokeColor={getStrokeColor(score)}
          />
        </Flex>
      ),
    },
    {
      title: "Recommended Optimization",
      dataIndex: "recommended_optimization",
      key: "recommended_optimization",
      width: "35%",
      render: ({ changes, type }: { changes: number; type: string }, record) =>
        changes === 0 ? (
          "--"
        ) : (
          <Flex align="center" justify="space-between">
            <Flex vertical>
              <Text
                text={`${changes} Changes`}
                type="footnote"
                color={Colors.PRIMARY_BLUE}
              />
              <Text text={OptimizationTypeMap[type] || ""} type="footnote" />
            </Flex>

            <Flex>
              <IconViewer
                Icon={ExportIcon}
                size={Metrics.SPACE_MD}
                color={Colors.PRIMARY_BLUE}
                onClick={() =>
                  updateRecommendationDrawerState({
                    open: true,
                    title: "Recommendations",
                    data: {
                      envName: record.envName,
                      description: record.description,
                      cost: record.cost,
                      optimizationType: {
                        ...record.recommended_optimization,
                        type: OptimizationTypeMap[
                          record.recommended_optimization.type
                        ],
                      },
                      recommendationStatus: record.recommendation_status,
                      changesRequired: record.changes_required,
                      recommendationId: record.recommendation_id,
                    },
                  })
                }
                customClass="cursor-pointer"
              />
            </Flex>
          </Flex>
        ),
    },
  ];

  const [recommendationDrawerState, updateRecommendationDrawerState] =
    useReducer<
      React.Reducer<
        RecommendationDrawerState,
        Partial<RecommendationDrawerState>
      >
    >(
      (prev, next) => {
        const newState: RecommendationDrawerState = { ...prev, ...next };
        return newState;
      },
      {
        title: "",
        open: false,
        data: {},
      } as RecommendationDrawerState,
    );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTable = () => (
    <Flex vertical gap={Metrics.SPACE_XS}>
      <Flex className="heading-row">
        <Text
          text={`Recommendations Feed`}
          type="cardtitle"
          weight="semibold"
        />
        <Flex className="actions">
          <IconViewer
            Icon={DownloadOutlined}
            size={Metrics.SPACE_MD}
            color={Colors.PRIMARY_BLUE}
            customClass="cursor-pointer"
          />
          <IconViewer
            Icon={isModalOpen ? CloseFullscreenIcon : FullscreenIcon}
            size={Metrics.SPACE_MD}
            color={Colors.PRIMARY_BLUE}
            customClass="cursor-pointer"
            onClick={() => setIsModalOpen(!isModalOpen)}
          />
        </Flex>
      </Flex>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        loading={isLoading}
        className="data-table"
      />
    </Flex>
  );

  return (
    <>
      {getTable()}
      <Modal
        centered
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width={850}
        footer={null}
        closable={false}
      >
        {getTable()}
      </Modal>
      <Drawer
        title={recommendationDrawerState?.title}
        open={recommendationDrawerState?.open}
        submitButtonText="Done"
        onClose={() => updateRecommendationDrawerState({ open: false })}
        onSubmit={() => updateRecommendationDrawerState({ open: false })}
        onCancel={() => updateRecommendationDrawerState({ open: false })}
      >
        <RecommendationDrawer data={recommendationDrawerState?.data} />
      </Drawer>
    </>
  );
};

export default AppRecommendationTable;
