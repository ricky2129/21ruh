import { useEffect, useMemo, useReducer, useState } from "react";
import {
  useGetApplicationDiagnosticsReport,
  useRunDiagnostics,
} from "react-query";
import { useGetDiagnosticsVersionsList } from "react-query/diagnosticQueries";
import {
  useCreateEnvironment,
  useCreateInfraSchedule,
} from "react-query/infraQueries";

import { CaretRightOutlined, PlusOutlined } from "@ant-design/icons";
import ApplyButton from "./applyButton";

import {
  Col,
  Flex,
  Form,
  Row,
  Select,
  Table,
  TableColumnsType,
  Tabs,
  Tag,
} from "antd";
import { configureInfraFormContants } from "constant";
import { Dayjs } from "dayjs";
import { convertSecondsToNearestTime } from "helpers";
import {
  ConfigureInfraFormFields,
  CreateEnvironmentRequest,
  CreateInfraScheduleRequest,
} from "interfaces";

import { ExportIcon } from "assets";

import {
  Button,
  ConfigureInfra,
  ConfirmationModal,
  Drawer,
  Empty,
  IconViewer,
  Loading,
  RecommendationDrawer,
  ResourceAnalysisChart,
  RunScans,
  ScanOverview,
  Text,
  ViewSelector,
} from "components";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./applicationDiagnostics.styles.scss";

interface option {
  label: string;
  value: string | number;
}

type RecommendationDrawerState = {
  title: string;
  open: boolean;
  data: {
    recommendationId: number;
    name: string;
    description: string;
    cost: number;
    optimizationType: {
      changes: number;
      type: string;
    };
    recommendationStatus: "NotImplemented" | "Implemented";
    is_action_taken: boolean;
    changesRequired: string[];
  };
};

const RecommendationLabelMap: Record<string, string> = {
  "SOP Recommendations": "SOPs",
  "Alarm Recommendations": "Alarms",
  "Test Recommendations": "Experiments Recommendations",
  "Resilience Recommendations": "Resilience Recommendations",
};

const RecommendationPriority: Record<string, number> = {
  "Alarm Recommendations": 1,
  "SOP Recommendations": 2,
  "Test Recommendations": 3,
};

const ReportScanStatusMap: Record<
  string,
  "notStarted" | "inprogress" | "completed" | "interrupted"
> = {
  Pending: "inprogress",
  InProgress: "inprogress",
  Success: "completed",
  Failed: "interrupted",
};

const OptimizationTypeMap: Record<string, string> = {
  LeastCost: "Optimize for cost",
  LeastChange: "Optimize for minimal changes",
  BestAZRecovery: "Optimize for Availability Zone RPO/RTO",
  LeastErrors: "Optimize for cost",
  BestAttainable: "",
  BestRegionRecovery: "Optimize for region RTO/RPO",
};




const resourcesTableColumns: TableColumnsType = [
  {
    title: "Logical ID",
    dataIndex: "logical_id",
    key: "logical_id",
    width: "25%",
    render: (name: string) => (
      <Text text={name} type="footnote" weight="semibold" />
    ),
  },
  {
    title: "Resource Type",
    dataIndex: "resource_type",
    key: "resource_type",
    width: "25%",
    render: (name: string) => <Text text={name} type="footnote" />,
  },
  {
    title: "Resource Name",
    dataIndex: "resource_name",
    key: "resource_name",
    width: "25%",
    render: (name: string) => (
      <Text
        text={name}
        type="footnote"
        weight="semibold"
        color={Colors.PRIMARY_BLUE}
      />
    ),
  },
  {
    title: "Physical ID",
    dataIndex: "physical_id",
    key: "physical_id",
    width: "25%",
    render: (name: string) => <Text text={name} type="footnote" />,
  },
];

const ApplicationDiagnostics: React.FC = () => {
  const {
    ENVIRONMENT_NAME,
    AWS_ACCOUNT,
    CLOUDFORMATION_STACK,
    RESILIENCY_POLICY,
    SCHEDULE_ASSESMENT,
  } = configureInfraFormContants;

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
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
  const [drawerDisabledSave, setDrawerDisabledSave] = useState<boolean>(false);
  const [currentEnvironment, setCurrentEnvironment] = useState<number>(0);
  const [selectedVersion, setSelectedVersion] = useState<string>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [configureInfraForm] = Form.useForm<ConfigureInfraFormFields>();
  

  const { data, refetch } = useGetApplicationDiagnosticsReport(currentEnvironment,
    selectedVersion,);

  const recommendationTableColumns: TableColumnsType = [
  {
    title: "Component Name",
    dataIndex: "component_name",
    key: "component_name",
    width: "30%",
    render: (name: string) => (
      <Text text={name} type="footnote" weight="semibold" />
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    width: "40%",
    render: (name: string) => (
      <Text text={name} type="footnote" weight="semibold" />
    ),
  },
  {
    title: "Action",
    dataIndex: "recommendation_status",
    key: "recommendation_status",
    width: "30%",
    render: (_: any, record: any) => (
    <ApplyButton
      recommendation_id={record.recommendation_id}
      recommendation_type={record.recommendation_type}
      is_action_taken={record.is_action_taken}
      serviceEnvId={currentEnvironment}
      refetch={refetch}
    />
  )
  },
]; 




  const {
    getServiceId,
    application: applicationDetails,
    isLoading: appLoading,
    refetchApplicationDetails,
  } = useAppNavigation();
  const createEnvironmentQuery = useCreateEnvironment();
  const createInfraScheduleQuery = useCreateInfraSchedule();
  const diagnosticsVersionsListQuery =
    useGetDiagnosticsVersionsList(currentEnvironment);
  const getDiagnosticsReportQuery = useGetApplicationDiagnosticsReport(
    currentEnvironment,
    selectedVersion,
  );
  const runDiagnosticsQuery = useRunDiagnostics();

  const environmentList = useMemo(() => {
    const repoData = applicationDetails?.services?.find(
      (service) => service.service === "Infrastructure",
    );

    if (!repoData) return [];

    return repoData?.environments
      ?.sort((a, b) => a.id - b.id)
      .map((environment) => {
        return {
          name: environment?.name,
          id: environment?.id?.toString(),
        };
      });
  }, [applicationDetails?.services]);

  const pieChartData = useMemo(() => {
    if (
      !(
        getDiagnosticsReportQuery.data &&
        getDiagnosticsReportQuery.data.resillencyScore
      )
    )
      return;

    const { resillencyScore, recommendationList } =
      getDiagnosticsReportQuery.data;

    const { Alarm, Compliance, Sop, Test } = resillencyScore.componentScore;

    return {
      chartData: [
        {
          label: "RTO/RPO",
          value: (Compliance.score / Compliance.possibleScore) * 100,
        },
        {
          label: "Alarms",
          value: (Alarm.score / Alarm.possibleScore) * 100,
        },
        {
          label: "SOPs",
          value: (Sop.score / Sop.possibleScore) * 100,
        },
        {
          label: "Experiments",
          value: (Test.score / Test.possibleScore) * 100,
        },
      ],
      recommendationList: [
        {
          label: "Alarms",
          value: recommendationList?.find(
            (recommendation) => recommendation.name === "Alarm Recommendations",
          )?.list.length,
        },
        {
          label: "SOPs",
          value: recommendationList?.find(
            (recommendation) => recommendation.name === "SOP Recommendations",
          )?.list.length,
        },
        {
          label: "Experiments",
          value: recommendationList?.find(
            (recommendation) => recommendation.name === "Test Recommendations",
          )?.list.length,
        },
      ],
      resillencyScore: resillencyScore.score * 100,
    };
  }, [getDiagnosticsReportQuery.data]);

  const basicDetails = useMemo(() => {
    if (!getDiagnosticsReportQuery.data || !diagnosticsVersionsListQuery.data)
      return [] as option[];

    const {
      id: version,
      environment_name,
      platform,
      scheduledFrequency,
      initiatedTime,
      lastDiagnosticTime,
    } = getDiagnosticsReportQuery.data;

    if (diagnosticsVersionsListQuery?.data?.length === 0)
      return [
        { label: "Environment Name", value: environment_name },
        { label: "Version", value: "V1.0" },
        { label: "Platform type", value: platform },
        { label: "Scheduled", value: "--" },
        {
          label: "Initiated Time",
          value: "--",
        },
        {
          label: "Last Diagnostics Time",
          value: "--",
        },
      ] as option[];

    return [
      { label: "Environment Name", value: environment_name },
      { label: "Version", value: `V${version}.0` },
      { label: "Platform type", value: platform },
      {
        label: "Scheduled",
        value:
          scheduledFrequency?.charAt(0)?.toLocaleUpperCase() +
          scheduledFrequency?.slice(1),
      },
      {
        label: "Initiated Time",
        value: initiatedTime ? new Date(initiatedTime)?.toUTCString() : "--",
      },
      {
        label: "Last Diagnostics Time",
        value: lastDiagnosticTime
          ? new Date(lastDiagnosticTime)?.toUTCString()
          : "--",
      },
    ] as option[];
  }, [diagnosticsVersionsListQuery.data, getDiagnosticsReportQuery.data]);

  const summaryData = useMemo(() => {
    if (!(getDiagnosticsReportQuery.data && getDiagnosticsReportQuery.data.RTO))
      return;

    const { RTO, RPO, resources } = getDiagnosticsReportQuery.data;

    return [
      {
        label: "RTO",
        value: convertSecondsToNearestTime(
          RTO?.individual?.find((d) => d?.label === "Software")?.current || 0,
        ),
      },
      {
        label: "RPO",
        value: convertSecondsToNearestTime(
          RPO?.individual?.find((d) => d?.label === "Software")?.current || 0,
        ),
      },
      { label: "No. of Resources", value: resources?.length },
    ] as option[];
  }, [getDiagnosticsReportQuery.data]);

  const versionList: option[] = useMemo(() => {
    if (
      diagnosticsVersionsListQuery?.isLoading ||
      !diagnosticsVersionsListQuery?.data
    )
      return [];

    if (
      diagnosticsVersionsListQuery?.data &&
      diagnosticsVersionsListQuery?.data?.length === 0
    )
      return [
        {
          label: "Version 1.0",
          value: "",
        },
      ];

    return diagnosticsVersionsListQuery.data?.map((version, index) => ({
      label: `Version ${version}.0`,
      value:
        diagnosticsVersionsListQuery.data.length === index + 1 ? "" : version,
    }));
  }, [
    diagnosticsVersionsListQuery?.data,
    diagnosticsVersionsListQuery?.isLoading,
  ]);

  const recommendationStats = useMemo(() => {
    if (
      !(
        getDiagnosticsReportQuery.data &&
        getDiagnosticsReportQuery.data.recommendationList
      )
    )
      return;

    const { recommendationList,componentRecomendation } = getDiagnosticsReportQuery.data;

    const length = recommendationList?.map((recommendation) => {
      return {
        name: recommendation?.name,
        length: recommendation?.list?.length,
      };
    });

    const com_length = componentRecomendation.length

    const total = Number(length?.reduce((total, l) => total + l.length, 0) + com_length);

    const implemented = recommendationList?.reduce((total, recommendation) => {
      return (
        total +
        recommendation?.list?.filter(
          (r) => r.is_action_taken === true,
        )?.length
      );
    }, 0);

    const com_implemented = componentRecomendation?.filter(
  (component) => component.is_action_taken === true
).length;
     
    const implemented_rs = Number(implemented + com_implemented);


    return {
      total,
      implemented_rs,
      pending: total - implemented_rs,
      length,
    };
  }, [getDiagnosticsReportQuery.data]);

  useEffect(() => {
    setSelectedVersion("");
  }, [currentEnvironment]);

  const onEnvironmentCreateSubmit = async () => {
    try {
      await configureInfraForm.validateFields();

      const serviceId = await getServiceId("Infrastructure");
      const envRequest: CreateEnvironmentRequest = {
        app_service_id: serviceId,
        environment: configureInfraForm.getFieldValue(ENVIRONMENT_NAME.NAME),
        integration_id: configureInfraForm.getFieldValue(AWS_ACCOUNT.NAME),
        resiliency_policy_arn: configureInfraForm.getFieldValue(
          RESILIENCY_POLICY.NAME,
        ),
        resource_group_arns: configureInfraForm
          ?.getFieldValue(CLOUDFORMATION_STACK.NAME)
          ?.map((resource) => {
            return {
              id: resource.value,
              name: resource.label,
              description: resource.description,
            };
          }),
      };

      const envResponse = await createEnvironmentQuery.mutateAsync(envRequest);

      const { frequency, date, time } = configureInfraForm.getFieldsValue([
        [SCHEDULE_ASSESMENT.FREQUENCY.NAME],
        [SCHEDULE_ASSESMENT.DATE.NAME],
        [SCHEDULE_ASSESMENT.TIME.NAME],
      ]) as { frequency: string; date: Dayjs; time: Dayjs };

      if (frequency && date && time) {
        const scheduleRequest: CreateInfraScheduleRequest = {
          service_env_id: envResponse.service_env_id,
          frequency: configureInfraForm
            .getFieldValue(SCHEDULE_ASSESMENT.FREQUENCY.NAME)
            .toLowerCase(),
          date: configureInfraForm
            .getFieldValue(SCHEDULE_ASSESMENT.DATE.NAME)
            .format("YYYY-MM-DD"),
          time: configureInfraForm
            .getFieldValue(SCHEDULE_ASSESMENT.TIME.NAME)
            .format("HH:mm:ss"),
        };

        await createInfraScheduleQuery.mutateAsync(scheduleRequest);
      }

      await refetchApplicationDetails();

      setIsDrawerOpen(false);
    } catch (error) {
      console.error(error);
      setDrawerDisabledSave(true);
    }
  };

  const handleRunDiagnostics = async () => {
    try {
      await runDiagnosticsQuery.mutateAsync(currentEnvironment);
      setSelectedVersion("");

      Promise.all([
        diagnosticsVersionsListQuery.refetch(),
        getDiagnosticsReportQuery.refetch(),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const resilienceTableColumns: TableColumnsType = [
    {
      title: "Component Name",
      dataIndex: "component_name",
      key: "component_name",
      width: "20%",
      render: (name: string) => (
        <Text text={name} type="footnote" weight="semibold" />
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (name: string) => (
        <Text text={name} type="footnote" weight="semibold" />
      ),
    },
    {
      title: "Recommended Optimization",
      dataIndex: "recommended_optimization",
      key: "recommended_optimization",
      width: "35%",
      render: (
        { changes, type }: { changes: number; type: string },
        record,
      ) => (
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
                  title: "Resilience Recommendations",
                  data: {
                    name: record.component_name,
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
                    is_action_taken: record.is_action_taken
                  },
                })
              }
              customClass="cursor-pointer"
            />
          </Flex>
        </Flex>
      ),
    },
    {
    title: "Action",
    dataIndex: "recommendation_status",
    key: "recommendation_status",
    render: (_: any, record: any) => (
      <ApplyButton
        recommendation_id={record.recommendation_id}
        recommendation_type={record.recommendation_type}
        component_name={record.component_name}
        is_action_taken={record.is_action_taken}
        serviceEnvId={currentEnvironment}
        refetch={refetch}
      />
    ),
  },
];

  if (!appLoading && environmentList?.length === 0)
    return (
      <>
        <Empty
          title="You have not added any environment yet."
          subtitle="Please click  “Add New Environment” button to get stated with."
        >
          <Button
            title={`Add New Environment`}
            icon={
              <IconViewer
                Icon={PlusOutlined}
                color={Colors.WHITE}
                size={Metrics.SPACE_MD}
              />
            }
            size="middle"
            onClick={() => {
              configureInfraForm.resetFields();
              setIsDrawerOpen(true);
            }}
          />
        </Empty>
        <Drawer
          title="Add New Environment"
          open={isDrawerOpen}
          disabled={drawerDisabledSave || createEnvironmentQuery?.isLoading}
          onClose={() => setIsDrawerOpen(false)}
          onCancel={() => setIsDrawerOpen(false)}
          onSubmit={onEnvironmentCreateSubmit}
          loading={createEnvironmentQuery?.isLoading}
        >
          <ConfigureInfra
            configureInfraForm={configureInfraForm}
            setDisabledSave={setDrawerDisabledSave}
            application_id={applicationDetails?.id?.toString()}
          />
        </Drawer>
      </>
    );

  const resourceTable = getDiagnosticsReportQuery.data &&
    getDiagnosticsReportQuery.data.resources && (
      <Flex vertical gap={Metrics.SPACE_XS}>
        <Text text="Resources" type="cardtitle" weight="semibold" />
        <Table
          columns={resourcesTableColumns}
          dataSource={
            getDiagnosticsReportQuery?.data &&
            getDiagnosticsReportQuery?.data?.resources?.map((data, index) => {
              return {
                key: index,
                logical_id: data?.logicalResourceId?.identifier,
                resource_type: data?.resourceType,
                resource_name: data?.resourceName,
                physical_id: data?.physicalResourceId?.identifier,
              };
            })
          }
          pagination={false}
          className="data-table"
        />
      </Flex>
    );

  return (
    <>
      <ViewSelector
        views={environmentList}
        type="Environment"
        onClickAddNew={() => {
          configureInfraForm.resetFields();
          setIsDrawerOpen(true);
        }}
        onChange={(view) => {
          setCurrentEnvironment(parseInt(view?.id));
        }}
      />

      <Flex justify="center" className="application-diagnostics-container">
        {getDiagnosticsReportQuery?.isLoading &&
        !getDiagnosticsReportQuery?.data ? (
          <Loading type="fullscreen" />
        ) : (
          <Flex vertical gap={Metrics.SPACE_MD} style={{ width: "100%" }}>
            <Flex align="center" justify="space-between">
              <Select
                options={versionList}
                value={selectedVersion}
                onSelect={(value) => setSelectedVersion(value)}
              />

              {diagnosticsVersionsListQuery?.data?.length !== 0 && (
                <Button
                  title="Run New Diagnostic"
                  size="middle"
                  icon={
                    <IconViewer
                      Icon={CaretRightOutlined}
                      color={Colors.WHITE}
                      width={10}
                    />
                  }
                  loading={runDiagnosticsQuery.isLoading}
                  onClick={() => setIsConfirmModalOpen(true)}
                />
              )}
            </Flex>

            <ScanOverview
              scanStatus={
                getDiagnosticsReportQuery?.data?.scanStatus
                  ? ReportScanStatusMap[
                      getDiagnosticsReportQuery?.data?.scanStatus
                    ]
                  : "notStarted"
              }
              details={basicDetails}
              restartScan={() => setIsConfirmModalOpen(true)}
              downloadReport={function (): void {
                throw new Error("Function not implemented.");
              }}
            />

            {diagnosticsVersionsListQuery?.data?.length === 0 ? (
              <>
                {resourceTable}
                <RunScans
                  text="Please run the diagnostics to get the metrics"
                  runningText="Diagnostic in progress..."
                  buttonText="Run Diagnostic"
                  loading={runDiagnosticsQuery.isLoading}
                  onRunScans={handleRunDiagnostics}
                />
              </>
            ) : (
              getDiagnosticsReportQuery?.data && (
                <>
                  {summaryData && (
                    <Row className="summary-container">
                      {summaryData?.map((data, index) => (
                        <Col
                          xs={24}
                          sm={12}
                          // md={6} // TODO: remove once we've correct remediation efficiency
                          md={8}
                          key={index}
                          className="summary-column"
                        >
                          <Text
                            color={Colors.GRAY_5}
                            type="footnote"
                            weight="semibold"
                            text={data.label}
                          />
                          <Text
                            color={Colors.BLACK_1}
                            text={data.value}
                            type="header3"
                            weight="semibold"
                          />
                        </Col>
                      ))}
                    </Row>
                  )}

                  {pieChartData && (
                    <Flex vertical gap={Metrics.SPACE_XS}>
                      <Text
                        text="Resource Analysed"
                        type="cardtitle"
                        weight="semibold"
                      />
                      <ResourceAnalysisChart data={pieChartData} />
                    </Flex>
                  )}

                  {resourceTable}

                  {recommendationStats && (
                    <Flex vertical gap={Metrics.SPACE_MD}>
                      <Flex gap={Metrics.SPACE_XS}>
                        <Text
                          type="cardtitle"
                          text="Recommendations"
                          weight="semibold"
                        />

                        <Flex
                          gap={Metrics.SPACE_XXS}
                          className="recommendation-tags"
                        >
                          <Tag bordered={false} color={Colors.COOL_GRAY_1}>
                            <Text
                              text={`Total ${recommendationStats.total}`}
                              type="footnote"
                              weight="semibold"
                              color={Colors.COOL_GRAY_11}
                            />
                          </Tag>
                          <Tag bordered={false} color={Colors.POLAR_GREEN_2}>
                            <Text
                              text={`Applied ${recommendationStats.implemented_rs}`}
                              type="footnote"
                              weight="semibold"
                              color={Colors.PRIMARY_GREEN_600}
                            />
                          </Tag>
                          <Tag bordered={false} color={Colors.SUNSET_ORANGE_2}>
                            <Text
                              text={`Pending ${recommendationStats.pending}`}
                              type="footnote"
                              weight="semibold"
                              color={Colors.SUNSET_ORANGE_7}
                            />
                          </Tag>
                        </Flex>
                      </Flex>
                      
                      <Tabs
                        type="card"
                        items={
                          getDiagnosticsReportQuery?.data &&
                          [
                            {
                              label: "Resilience Recommendations",
                              key: "Resilience Recommendations",
                              children: (
                                <Table
                                  columns={resilienceTableColumns}
                                  dataSource={
                                    getDiagnosticsReportQuery?.data?.componentRecomendation
                                      ? getDiagnosticsReportQuery?.data?.componentRecomendation.map(
                                          (data, index) => ({
                                            key: index,
                                            recommendation_id: data.recommendationId,
                                            component_name: data.componentName,
                                            recommendation_type: "Resilience Recommendation", 
                                            description: data.description,
                                            is_action_taken: data.is_action_taken,
                                            cost: data.cost.amount,
                                            recommended_optimization: {
                                              changes: data.suggestedChanges.length,
                                              type: data.optimizationType,
                                            },
                                            recommendation_status: "Implemented",
                                            changes_required: data.suggestedChanges,
                                          })
                                        )
                                      : []
                                  }
                                  pagination={false}
                                  className="data-table"
                                />
                              ),
                            },
                          ].concat(
                            getDiagnosticsReportQuery?.data?.recommendationList
                              ?.sort((a, b) => {
                                return (
                                  RecommendationPriority[a.name] -
                                  RecommendationPriority[b.name]
                                );
                              })
                              ?.map((tab) => ({
                                label: RecommendationLabelMap[tab.name] || "",
                                key: tab.name,
                                children: (
                                  <Table
                                    columns={recommendationTableColumns}
                                    dataSource={tab?.list?.map((data, index) => ({
                                      key: index,
                                      recommendation_id: data.recommendationId,
                                      recommendation_type: tab.name,
                                      component_name: data.name,
                                      description: data.description,
                                      is_action_taken: data.is_action_taken,
                                      recommendation_status: data.recommendationStatus,
                                      changes_required: data.changesRequired,
                                    }))}
                                    pagination={false}
                                    className="data-table"
                                  />
                                ),
                              }))
                          )
                        }
                        className="recommendation-tab"
                      />
                    </Flex>
                  )}
                </>
              )
            )}
          </Flex>
        )}
      </Flex>

      <Drawer
        title="Add New Environment"
        open={isDrawerOpen}
        disabled={drawerDisabledSave}
        loading={createEnvironmentQuery.isLoading}
        onClose={() => setIsDrawerOpen(false)}
        onCancel={() => setIsDrawerOpen(false)}
        onSubmit={onEnvironmentCreateSubmit}
      >
        <ConfigureInfra
          configureInfraForm={configureInfraForm}
          setDisabledSave={setDrawerDisabledSave}
          application_id={applicationDetails?.id?.toString()}
        />
      </Drawer>

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

      <ConfirmationModal
        loading={
          runDiagnosticsQuery.isLoading ||
          diagnosticsVersionsListQuery.isLoading
        }
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleRunDiagnostics}
        title="Run new Diagnostic"
        width={400}
        message={
          <span>
            <Text
              text={
                "You are about to run new diagnostics and this will be saved as "
              }
            />
            <Text
              text={`Version ${
                Number(
                  diagnosticsVersionsListQuery?.data
                    ? diagnosticsVersionsListQuery?.data[
                        diagnosticsVersionsListQuery?.data?.length - 1
                      ]
                    : "0",
                ) + 1
              }.0.`}
              weight="bold"
            />
          </span>
        }
        okText="Start Diagnostics"
        centered
      />
    </>
  );
};

export default ApplicationDiagnostics;
