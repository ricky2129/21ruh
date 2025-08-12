import { useMemo, useState } from "react";
import {
  useGetPortfolioDetails,
  useGetPortfolioGraphData,
  useGetPortfolioRecommendation,
} from "react-query/dashboardQueries";

import { PlusOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Flex, Row } from "antd";

import {
  DashboardCard,
  Loading,
  PortfolioRecommendationTable,
  PortfolioReliabilityPostureGraph,
  PortfolioReliabilityPostureTable,
  PortfolioReliabilityScoreGraph,
  PortfolioReliabilityScoreTable,
  Text,
} from "components";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./projectDashboard.styles.scss";

export const ProjectDashboard: React.FC = () => {
  const { project: projectDetails, isLoading: potfolioLoading } =
    useAppNavigation();

  const graphDataQuery = useGetPortfolioGraphData(projectDetails?.id);
  const detailsQuery = useGetPortfolioDetails(projectDetails?.id);
  const recommendationQuery = useGetPortfolioRecommendation(projectDetails?.id);

  const [selectedScoreApp, setSelectedScoreApp] =
    useState("Top 5 applications");
  const [selectedPostureApp, setSelectedPostureApp] =
    useState("Top 5 applications");

  const summaryData = useMemo(() => {
    return [
      {
        label: "SLO Breached",
        value: detailsQuery?.data?.SLO,
      },
      {
        label: "SLI Breached",
        value: detailsQuery?.data?.SLI,
      },
      {
        label: "Automation Efficiency",
        value: `${detailsQuery?.data?.Remediation}%`,
        color: Colors.BRIGHT_RED
      },
      {
        label: "Total No of Applications",
        value: detailsQuery?.data?.applications,
      },
    ];
  }, [detailsQuery?.data]);

  const scoreGraphData = useMemo(() => {
    if (!graphDataQuery?.data) return [];

    if (selectedScoreApp === "Top 5 applications")
      return graphDataQuery?.data
        ?.sort(
          (a, b) => a.actual_reliability_score - b.actual_reliability_score,
        )
        .slice(0, 5);

    const data = graphDataQuery?.data?.find(
      (d) => d.app_name === selectedScoreApp,
    );
    return data ? [data] : [];
  }, [graphDataQuery?.data, selectedScoreApp]);

  const postureGraphData = useMemo(() => {
    if (!graphDataQuery?.data) return [];

    if (selectedPostureApp === "Top 5 applications")
      return graphDataQuery?.data
        ?.sort(
          (a, b) => a.actual_reliability_score - b.actual_reliability_score,
        )
        .slice(0, 5);

    const data = graphDataQuery?.data?.find(
      (d) => d.app_name === selectedPostureApp,
    );
    return data ? [data] : [];
  }, [selectedPostureApp, graphDataQuery?.data]);

  if (potfolioLoading || detailsQuery.isLoading)
    return <Loading />;

  return (
    <>
      <Row className="top-flex-layout" justify="space-between" align="middle">
        <Col>
          <Button type="default">Reliability Summary</Button>
        </Col>
        <Col className="right-buttons">
          <Button type="default" icon={<SwapOutlined />}>
            Switch Dashboard
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Custom Dashboard
          </Button>
        </Col>
      </Row>

      <Flex gap={Metrics.SPACE_MD} vertical className="container">
        <Row className="summary-container" justify="space-around">
          {summaryData?.map((data, index) => (
            <>
              <Col xs={24} sm={12} md={4} lg={4} xl={4} key={index}>
                <Text
                  color={Colors.GRAY_5}
                  type="footnote"
                  weight="semibold"
                  text={data.label}
                />
                <Text
                  color={data.color ? data.color : Colors.BLACK_1}
                  text={data.value}
                  type="header3"
                  weight="semibold"
                />
              </Col>
              {index < summaryData?.length - 1 && (
                <Flex className="divider">
                  <Divider type="vertical" />
                </Flex>
              )}
            </>
          ))}
        </Row>

        <Row
          gutter={[Metrics.SPACE_MD, Metrics.SPACE_MD]}
          justify="space-around"
        >
          <Col sm={24} lg={13}>
            <DashboardCard
              cardTitle="Average App Reliability Score"
              GraphComponent={
                <PortfolioReliabilityScoreGraph
                  data={scoreGraphData.map((d) => ({
                    app: d?.app_name,
                    score: d?.actual_reliability_score,
                  }))}
                />
              }
              TableComponent={
                <PortfolioReliabilityScoreTable
                  data={scoreGraphData.map((d) => ({
                    app: d?.app_name,
                    score: d?.actual_reliability_score,
                  }))}
                />
              }
              selectionItems={["Top 5 applications"].concat(
                graphDataQuery?.data?.map((d) => d?.app_name),
              )}
              onSelectionChange={(data) => setSelectedScoreApp(data)}
              loading={graphDataQuery?.isLoading}
            />
          </Col>

          <Col sm={24} lg={11}>
            <DashboardCard
              cardTitle="Reliability Posture"
              GraphComponent={
                <PortfolioReliabilityPostureGraph data={postureGraphData} />
              }
              TableComponent={
                <PortfolioReliabilityPostureTable data={postureGraphData} />
              }
              selectionItems={["Top 5 applications"].concat(
                graphDataQuery?.data?.map((d) => d?.app_name),
              )}
              onSelectionChange={(data) => setSelectedPostureApp(data)}
              loading={graphDataQuery?.isLoading}
            />
          </Col>
        </Row>
        <Row className="recommendations-container">
          <Col span={24}>
            <PortfolioRecommendationTable
              data={recommendationQuery?.data?.map((data, index) => ({
                key: index,
                app: data?.application,
                resourceName: data?.componentName,
                reliabilityScore: data?.reliablity_score,
                description: data?.description,
                cost: data?.cost?.amount,
                recommended_optimization: {
                  changes: data?.suggestedChanges?.length,
                  type: data?.optimizationType,
                },
                changes_required: data?.suggestedChanges,
              }))}
              isLoading={recommendationQuery?.isLoading}
            />
          </Col>
        </Row>
      </Flex>
    </>
  );
};

export default ProjectDashboard;
