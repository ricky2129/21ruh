import { Fragment, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  useCreateExperiments,
  useGetActiveChaosAgents,
  useGetChaosData,
  useGetChaosVersions,
  useHaltExperiment,
  useResrunChaosScan,
} from "react-query";
import { useSearchParams } from "react-router-dom";

import {
  CaretRightOutlined,
  PauseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Flex, Form, Select } from "antd";
import { configureExperimentFormConstants } from "constant";
import {
  ConfigureExperimentFormFieldType,
  CreateExperimentRequest,
} from "interfaces";

import {
  Button,
  ConfigureExperiment,
  ConfirmationModal,
  Drawer,
  Empty,
  IconViewer,
  Loading,
  ResultsTimeline,
  RunScans,
  ScanOverview,
  ServerUtilizationGraph,
  Text,
  ViewSelector,
} from "components";

import { useAppNavigation } from "context";

import { Colors, Metrics } from "themes";

import "./experiments.style.scss";

interface Option {
  label: string;
  value: string | number | React.ReactElement;
}

/**
 * Experiments is a page component that displays a list of experiments that have been
 * run for an application. It allows the user to view details of the experiments, run
 * new scans, and add new experiments. The page is rendered conditionally based on the
 * presence of experiments in the application data. If no experiments have been added,
 * the page displays an empty state and a button to add new experiments. If experiments
 * have been added, the page displays a list of experiments and allows the user to
 * view details of the experiments, run new scans, and add new experiments.
 * @returns {React.ReactElement} The experiments page component.
 */
const Experiments: React.FC = () => {
  const { application, getServiceId, refetchApplicationDetails } =
    useAppNavigation();
  const [configureExperimentForm] =
    Form.useForm<ConfigureExperimentFormFieldType>();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");

  const { EXPERIMENT_NAME, SCENARIO_NAME, AGENT, HEALTH_CHECK } =
    configureExperimentFormConstants;

  const service_id = application?.services?.find(
    (service) => service.service === "Experiments",
  )?.id;

  // Chaos React Queries
  const getChaosDataQuery = useGetChaosData(view, selectedVersion?.toString());
  const getChaosVersions = useGetChaosVersions(view);
  const rescanQuery = useResrunChaosScan(view);
  const createExperimentQuery = useCreateExperiments();
  const getActiveChoasAgents = useGetActiveChaosAgents(service_id?.toString());
  const haltExperiment = useHaltExperiment();

  const experimentsList = useMemo(() => {
    const experimentsData = application?.services?.find(
      (service) => service.service === "Experiments",
    );

    if (!experimentsData) return [];

    return experimentsData?.environments
      .sort((a, b) => a.id - b.id)
      .map((environment) => {
        return {
          name: environment?.name,
          id: environment?.id?.toString(),
        };
      });
  }, [application?.services]);

  const detailsData: Option[] = useMemo(() => {
    return [
      {
        label: "Experiment Name",
        value: getChaosDataQuery?.data?.result?.experiment_name
          ? getChaosDataQuery?.data?.result?.experiment_name
          : "---",
      },
      {
        label: "Version",
        value:
          getChaosVersions?.isLoading || getChaosVersions?.isError
            ? "---"
            : `V${selectedVersion ? selectedVersion : 1}.0`,
      },
      {
        label: "Agent Name",
        value: getChaosDataQuery?.data?.result?.agent_name?.[0]
          ? getChaosDataQuery?.data?.result?.agent_name?.[0]
          : "---",
      },
      { label: "Platform Type", value: "Gremlin" },
      {
        label: "SLI",
        value:
          getChaosDataQuery?.data?.result &&
          getChaosDataQuery?.data?.result?.final_stage === "Completed"
            ? "SLI Name"
            : "--",
      },
      {
        label: "SLI Status",
        value: (
          <Text
            text={
              getChaosDataQuery?.data?.result &&
              getChaosDataQuery?.data?.result?.final_stage === "Completed"
                ? "Within Budget"
                : "--"
            }
            color={Colors.POLAR_GREEN_8}
            weight="semibold"
          />
        ),
      },
      {
        label: "Initiated Time",
        value: getChaosDataQuery?.data?.result?.created_at
          ? new Date(getChaosDataQuery?.data?.result?.created_at)?.toUTCString()
          : "---",
      },
      {
        label: "Last Scanned Time",
        value: getChaosDataQuery?.data?.result?.updated_at
          ? new Date(getChaosDataQuery?.data?.result?.updated_at).toUTCString()
          : "---",
      },
      {
        label: "App SLO",
        value: "--",
      },
    ];
  }, [
    getChaosDataQuery?.data,
    selectedVersion,
    getChaosVersions?.isLoading,
    getChaosVersions?.isError,
  ]);

  useEffect(() => {
    const totalVersions = getChaosVersions?.data?.version;

    if (totalVersions && totalVersions?.length)
      setSelectedVersion(totalVersions[totalVersions.length - 1]);
    else setSelectedVersion(null);
  }, [getChaosVersions?.data, getChaosVersions?.isLoading]);

  useLayoutEffect(() => {
    setSelectedVersion(null);
  }, [view]);

  /**
   * Handles the rescan action by refetching the rescan query and updating the list of versions.
   * Catches any errors that may occur during the mutation and logs them to the console.
   */
  const handleRescan = async () => {
    try {
      await rescanQuery.refetch();

      await getChaosVersions.refetch();
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Resets the fields of the experiment configuration form and opens the drawer.
   */
  const openAddDrawer = () => {
    configureExperimentForm.resetFields();
    setOpenDrawer(true);
  };

  /**
   * Handles the submission of the experiment configuration form.
   * Validates the form fields and logs any errors encountered during the process.
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    try {
      await configureExperimentForm.validateFields();

      const selectedAgent = getActiveChoasAgents?.data?.find(
        (agent) =>
          agent.agent_local_ip ===
          configureExperimentForm.getFieldValue(AGENT.NAME),
      );

      if (!selectedAgent) {
        throw new Error("Agent not found");
      }

      const req: CreateExperimentRequest = {
        experiment_name: configureExperimentForm?.getFieldValue(
          EXPERIMENT_NAME.NAME,
        ),
        app_service_id: (await getServiceId("Experiments"))?.toString(),
        scenario_name: configureExperimentForm.getFieldValue(
          SCENARIO_NAME.NAME,
        ),
        agent: {
          name: selectedAgent.agent_name,
          local_ip: selectedAgent.agent_local_ip,
          os_type: selectedAgent.agent_os_type,
          zone: selectedAgent.agent_zone,
          target: selectedAgent.target_type,
        },
        health_check: configureExperimentForm?.getFieldValue(HEALTH_CHECK.NAME),
      };

      await createExperimentQuery.mutateAsync(req);

      await refetchApplicationDetails();
      setOpenDrawer(false);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Handles halting an experiment.
   *
   * Calls the `mutateAsync` function of the `haltExperiment` query with the
   * `service_env_id` from the query string and the `selectedVersion` from the
   * component state. If the mutation is successful, it will refetch the
   * `getChaosDataQuery` query. If the mutation fails, it will log the error to
   * the console.
   */
  const handleHaltExperiment = async () => {
    try {
      await haltExperiment.mutateAsync({
        service_env_id: view,
        version: selectedVersion.toString(),
      });

      await getChaosDataQuery?.refetch();
    } catch (err) {
      console.error(err);
    }
  };
  const percentageCompleted = useMemo(() => {
    return Math.floor(
      (getChaosDataQuery?.data?.graph_nodes.filter(
        (file) => file?.lifecycle === "Successful",
      )?.length /
        getChaosDataQuery?.data?.graph_nodes?.length) *
        100,
    );
  }, [getChaosDataQuery?.data]);

  return (
    <Fragment>
      {experimentsList.length === 0 ? (
        <Empty
          title="You have not added any Experiments yet."
          subtitle='Please click “Add New Experiment" button to get stated with.'
        >
          <Button
            title={`Add New Experiment`}
            icon={
              <IconViewer
                Icon={PlusOutlined}
                color={Colors.WHITE}
                size={Metrics.SPACE_MD}
              />
            }
            size="middle"
            onClick={openAddDrawer}
          />
        </Empty>
      ) : (
        <Flex vertical className="application-experiments-container">
          {getChaosDataQuery?.isLoading && <Loading />}

          <ViewSelector
            type="Experiments"
            onClickAddNew={() => setOpenDrawer(true)}
            onChange={() => {
              setSelectedVersion(null);
            }}
            views={experimentsList}
          />

          <Flex
            vertical
            gap={Metrics.SPACE_MD}
            className="application-experiments-content"
          >
            <Flex
              align="center"
              justify="space-between"
              gap={Metrics.SPACE_SM}
              wrap
            >
              <Select
                options={
                  getChaosVersions?.isLoading
                    ? []
                    : getChaosVersions?.data?.version?.length === 0
                      ? [{ value: 1, label: "Version 1.0" }]
                      : getChaosVersions?.data?.version?.map((version) => {
                          return {
                            value: version,
                            label: `Version ${version}.0`,
                          };
                        })
                }
                loading={getChaosVersions?.isLoading}
                value={selectedVersion ? selectedVersion : 1}
                onSelect={(value) => setSelectedVersion(value)}
              />
              <Flex align="center" gap={Metrics.SPACE_MD}>
                {getChaosDataQuery?.data?.result?.final_stage === "Active" ? (
                  <Button
                    title="Stop"
                    size="middle"
                    icon={<PauseCircleOutlined />}
                    onClick={handleHaltExperiment}
                    disabled={
                      haltExperiment?.isLoading || getChaosDataQuery?.isLoading
                    }
                    loading={haltExperiment?.isLoading}
                    danger
                  />
                ) : (
                  getChaosDataQuery?.data?.result &&
                  getChaosDataQuery?.data?.result?.final_stage !==
                    "NotStarted" && (
                    <Button
                      title="Re-run Experiment"
                      size="middle"
                      icon={
                        <IconViewer
                          Icon={CaretRightOutlined}
                          color={Colors.WHITE}
                          width={10}
                        />
                      }
                      onClick={() => setIsConfirmModalOpen(true)}
                      disabled={
                        rescanQuery?.isLoading || getChaosDataQuery?.isLoading
                      }
                    />
                  )
                )}
              </Flex>
            </Flex>
            <ScanOverview
              details={detailsData}
              scanStatus={
                getChaosDataQuery?.data?.result?.final_stage === "Active"
                  ? percentageCompleted
                  : getChaosDataQuery?.isLoading
                    ? "notStarted"
                    : getChaosDataQuery?.data?.result?.final_stage === "Halted"
                      ? "interrupted"
                      : getChaosDataQuery?.data?.result?.final_stage ===
                          "Completed"
                        ? "completed"
                        : getChaosDataQuery?.data?.result?.final_stage ===
                            "NotStarted"
                          ? "soonStarting"
                          : "notStarted"
              }
              restartScan={() => setIsConfirmModalOpen(true)}
              downloadReport={() => {}}
            />
            {getChaosVersions?.data?.version?.length === 0 ? (
              <RunScans
                loading={rescanQuery?.isLoading}
                onRunScans={() => {
                  if (getChaosVersions?.data?.version?.length > 0)
                    setIsConfirmModalOpen(true);
                  else handleRescan();
                }}
              />
            ) : (
              <>
                <Flex vertical gap={Metrics.SPACE_XS}>
                  <Text
                    text="[Server/Hardware] Utilization"
                    type="bodycopy"
                    weight="semibold"
                  />
                  <Flex className="server-utilization-graph-container">
                    {getChaosDataQuery?.data?.metrics &&
                    getChaosDataQuery?.data?.metrics?.length > 0 ? (
                      <ServerUtilizationGraph
                        metric_data={getChaosDataQuery?.data?.metrics
                          ?.map((value) => value?.metric_data)
                          ?.flat()
                          ?.sort((a, b) => a.timestamp - b.timestamp)}
                      />
                    ) : (
                      <></>
                    )}
                  </Flex>
                </Flex>
                <Flex vertical gap={Metrics.SPACE_XS}>
                  <Text text="Results" type="bodycopy" weight="semibold" />

                  {getChaosDataQuery?.data?.graph_nodes &&
                  getChaosDataQuery?.data?.graph_nodes?.length ? (
                    <ResultsTimeline
                      graph_nodes={getChaosDataQuery?.data?.graph_nodes?.map(
                        (node, index) => {
                          return {
                            ...node,
                            metric: getChaosDataQuery?.data?.metrics?.[index],
                            start_time:
                              getChaosDataQuery?.data?.graph_node_details?.[
                                index
                              ]?.start_time,
                            end_time:
                              getChaosDataQuery?.data?.graph_node_details?.[
                                index
                              ]?.end_time,
                          };
                        },
                      )}
                      handleRerun={() => setIsConfirmModalOpen(true)}
                    />
                  ) : (
                    <></>
                  )}
                </Flex>
              </>
            )}
          </Flex>
        </Flex>
      )}
      <Drawer
        title="Add New Experiment"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onCancel={() => setOpenDrawer(false)}
        onSubmit={handleSubmit}
        disabled={disabledSave || createExperimentQuery?.isLoading}
        loading={createExperimentQuery?.isLoading}
      >
        <ConfigureExperiment
          configureExperimentForm={configureExperimentForm}
          chaosAgents={getActiveChoasAgents?.data?.map((agent) => {
            return {
              label: agent.agent_name,
              value: agent.agent_local_ip,
            };
          })}
          setDisabledSave={setDisabledSave}
        />
      </Drawer>
      <ConfirmationModal
        loading={rescanQuery.isLoading || getChaosVersions.isLoading}
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleRescan}
        title="Run new scan"
        width={400}
        message={
          <span>
            You are about to run new diagnostics and this will be saved as{" "}
            <strong>
              Version{" "}
              {parseInt(
                getChaosVersions?.data?.version[
                  getChaosVersions?.data?.version?.length - 1
                ]?.toString(),
              ) + 1}
              .0
            </strong>
            .
          </span>
        }
        okText="Rerun Experiments"
        centered
      />
    </Fragment>
  );
};

export default Experiments;
