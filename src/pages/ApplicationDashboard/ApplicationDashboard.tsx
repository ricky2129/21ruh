import { useEffect, useMemo, useState } from "react";
import {
  useGetAppDashboardRecommendationDetails,
  useGetAppReliabilityScore,
  useGetDashboardDetails,
} from "react-query";
import { useGetAppReliabilityPosture } from "react-query/dashboardQueries";
import { Col, Flex, Row } from "antd";
import {
  AppRecommendationTable,
  AppReliabilityPostureGraph,
  AppReliabilityPostureTable,
  AppReliabilityScoreGraph,
  AppReliabilityScoreTable,
  DashboardCard,
  Loading,
  Text,
} from "components";
import { useAppNavigation } from "context";
import { Colors, Metrics } from "themes";
import "./applicationDashboard.styles.scss";
 
const ApplicationDashboard: React.FC = () => {
  const { application: applicationDetails, isLoading: appLoading } = useAppNavigation();
 
  const appDetailQuery = useGetDashboardDetails(applicationDetails?.id?.toString());
  const recommendationQuery = useGetAppDashboardRecommendationDetails(applicationDetails?.id?.toString());
  const appReliabilityScoreQuery = useGetAppReliabilityScore(applicationDetails?.id);
  const useReliabilityPostureQuery = useGetAppReliabilityPosture(applicationDetails?.id);
 
  const [selectedScoreEnv, setSelectedScoreEnv] = useState("");
  const [selectedPostureEnv, setSelectedPostureEnv] = useState("");
 
  // summaryData now always uses backend values (no hardcoded fallback)
  const summaryData = useMemo(() => {
    return [
      { label: "SLO Breached", value: appDetailQuery?.data?.SLO ?? 0 },
      { label: "SLI Breached", value: appDetailQuery?.data?.SLI ?? 0 },
      { label: "RTO/RPO missed", value: appDetailQuery?.data?.RTO_RPO_missed ?? 0 },
      { label: "Anti-patterns", value: appDetailQuery?.data?.antipatterns ?? 0 },
    ];
  }, [appDetailQuery?.data]);
 
  useEffect(() => {
    if (!appReliabilityScoreQuery?.data || appReliabilityScoreQuery?.data?.length === 0) return;
    setSelectedScoreEnv(appReliabilityScoreQuery?.data[0].env_name);
    setSelectedPostureEnv(appReliabilityScoreQuery?.data[0].env_name);
  }, [appReliabilityScoreQuery?.data]);
 
  // Loading state only
  if (appLoading || appDetailQuery.isLoading) return <Loading />;
 
  return (
    <>
      <Flex gap={Metrics.SPACE_MD} vertical className="container">
        <Row className="summary-container" justify="space-around">
          {summaryData?.map((data, index) => (
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={4}
              xl={4}
              key={index}
              className="summary-column"
            >
              <Text color={Colors.GRAY_5} type="footnote" weight="semibold" text={data.label} />
              <Text color={Colors.BLACK_1} text={data.value} type="header3" weight="semibold" />
            </Col>
          ))}
        </Row>
 
        <Row gutter={[Metrics.SPACE_MD, Metrics.SPACE_MD]} justify="space-around">
          <Col sm={24} lg={13}>
            <DashboardCard
              cardTitle="Application Reliability Score"
              GraphComponent={
                <AppReliabilityScoreGraph
                  data={
                    appReliabilityScoreQuery?.data?.find(
                      (env) => env.env_name === selectedScoreEnv,
                    )?.data || []
                  }
                />
              }
              TableComponent={
                <AppReliabilityScoreTable
                  data={
                    appReliabilityScoreQuery?.data?.find(
                      (env) => env.env_name === selectedScoreEnv,
                    )?.data || []
                  }
                />
              }
              selectionItems={appReliabilityScoreQuery?.data?.map((env) => env.env_name) || []}
              selectPlaceholder="Select Environment"
              onSelectionChange={(data) => setSelectedScoreEnv(data)}
              loading={appReliabilityScoreQuery?.isLoading}
            />
          </Col>
 
          <Col sm={24} lg={11}>
            <DashboardCard
              cardTitle="Reliability Posture"
              GraphComponent={
                <AppReliabilityPostureGraph
                  data={useReliabilityPostureQuery?.data?.find((env) => env.env_name === selectedPostureEnv)}
                />
              }
              TableComponent={
                <AppReliabilityPostureTable
                  data={useReliabilityPostureQuery?.data?.find((env) => env.env_name === selectedPostureEnv)}
                />
              }
              selectionItems={useReliabilityPostureQuery?.data?.map((env) => env.env_name) || []}
              selectPlaceholder="Select Environment"
              onSelectionChange={(data) => setSelectedPostureEnv(data)}
              loading={useReliabilityPostureQuery?.isLoading}
            />
          </Col>
        </Row>
 
        <Row className="recommendations-container">
          <Col span={24}>
            <AppRecommendationTable
              data={
                recommendationQuery?.data
                  ? recommendationQuery?.data?.map((data, index) => ({
                      key: index,
                      envName: data.environment,
                      resourceName: data.componentName,
                      reliabilityScore: data.reliablity_score,
                      description: data.description,
                      cost: data.cost.amount,
                      recommended_optimization: {
                        changes: data.suggestedChanges.length,
                        type: data.optimizationType,
                      },
                      changes_required: data.suggestedChanges,
                    }))
                  : []
              }
              isLoading={recommendationQuery.isLoading}
            />
          </Col>
        </Row>
      </Flex>
    </>
  );
};
 
export default ApplicationDashboard;