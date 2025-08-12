import { useEffect, useMemo, useState } from "react";
import {
  useAnalyzeRepo,
  useCloneRepo,
  useCodeScan,
  useFetchCode,
  useGetCodeScanDashboard,
  useRescan,
  useTotalVersions,
  useUpdateActionTaken,
} from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
 
import {
  CaretRightOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Col, Flex, Form, Row, Select, Table, Tag } from "antd";
import { ConfigureRepositoriesConstants, RouteUrl } from "constant";
import { resolveUrlParams } from "helpers";
import {
  ApplicationDetails,
  CloneRepoRequest,
  ConfigureRepositoriesFormField,
  Environment,
  FetchCodeScanResponse,
  FileData,
  UpdateActionRequest,
} from "interfaces";
 
import {
  Button,
  ConfigureRepositories,
  ConfirmationModal,
  Drawer,
  Empty,
  FilesAnalysed,
  IconViewer,
  Loading,
  RunScans,
  ScanOverview,
  Text,
  ViewSelector,
} from "components";
 
import { useAppNavigation } from "context";
 
import { Colors, Metrics } from "themes";
 
import AntiPattern from "./AntiPattern";
import "./applicationCodescan.style.scss";
 
interface Option {
  label: string;
  value: number | string;
}
 
const ApplicationCodescan: React.FC = () => {
  const [isRepositoryDrawerOpen, setIsRepositoryDrawerOpen] =
    useState<boolean>(false);
  const [repositoryDrawerType, setRepositoryDrawerType] = useState<
    "new" | "edit"
  >("new");
  const [isAntiPatterDrawerOpen, setIsAntiPatternDrawerOpen] =
    useState<boolean>(false);
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isOpenRepoLimitModal, setIsOpenRepoLimitModal] =
    useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const [configureRepositoriesForm] =
    Form.useForm<ConfigureRepositoriesFormField>();
 
  // Use doc_id instead of index for anti-pattern selection
  const [selectedAntiPatternId, setSelectedAntiPatternId] = useState<string | null>(null);
 
  //config repository constants
  const { REPOSITORY_URL, BRANCH_NAME, AWS_ACCOUNT, NAME } =
    ConfigureRepositoriesConstants;
 
  //context
  const { getServiceId, application, isLoading, refetchApplicationDetails } =
    useAppNavigation();
 
  // React queries
  const service_env_id = searchParams?.get("view");
 
  const totalVersionsQuery = useTotalVersions(service_env_id);
  const cloneRepoQuery = useCloneRepo();
  const rescanQuery = useRescan();
  const codeScanQuery = useCodeScan(service_env_id, selectedVersion);
 
  //total versions in a repository
  const totalVersions: Option[] = useMemo(() => {
    if (!totalVersionsQuery?.data || !totalVersionsQuery?.data?.versions)
      return [];
    return totalVersionsQuery?.data?.versions?.map((version) => {
      return { label: `Version ${version}.0`, value: version };
    });
  }, [totalVersionsQuery.data]);
 
  const latestVersionData = useCodeScan(
    service_env_id,
    parseInt(totalVersions?.[totalVersions?.length - 1]?.value?.toString() || "0"),
  );
 
  const getCodeScanDashboardQuery = useGetCodeScanDashboard(
    service_env_id,
    selectedVersion,
    codeScanQuery?.data?.status,
  );
 
  const fetchCodeQuery = useFetchCode(
    service_env_id,
    selectedVersion,
    codeScanQuery?.data?.status,
  );
 
  const updateActionQuery = useUpdateActionTaken();
  const analyzeCodeQuery = useAnalyzeRepo();
 
  const navigate = useNavigate();
 
  //summary data
  const summaryData: Option[] = useMemo(() => {
    return [
      {
        label: "Files Analysed",
        value: getCodeScanDashboardQuery?.data?.totalUniqueFiles,
      },
      {
        label: "Unique Anti-Patterns",
        value: getCodeScanDashboardQuery?.data?.totalUniqueAntipatterns,
      },
      {
        label: "Code Remediation",
        value: getCodeScanDashboardQuery?.data?.remediatedFunctionsCount,
      },
      {
        label: "Able to fix",
        value: fetchCodeQuery?.data?.filter((data) => data.isActionTaken)
          ?.length,
      },
    ];
  }, [getCodeScanDashboardQuery?.data, fetchCodeQuery?.data]);
 
  // Repository list
  const repositoryList = useMemo(() => {
    const repoData = application?.services?.find(
      (service) => service.service === "Repositories",
    );
 
    if (!repoData) return null;
 
    return repoData?.environments
      .sort((a, b) => a.id - b.id)
      .map((environment) => {
        return {
          name: environment?.name,
          id: environment?.id?.toString(),
        };
      });
  }, [application?.services]);
 
  useEffect(() => {
    if (!isLoading && repositoryList && repositoryList?.length <= 1)
      setIsOpenRepoLimitModal(true);
  }, [repositoryList, isLoading]);
 
  const detailsData: Option[] = useMemo(() => {
    return [
      {
        label: "Repository Name",
        value: repositoryList?.find((repo) => repo.id === service_env_id)?.name,
      },
      {
        label: "Version",
        value: codeScanQuery?.data?.version
          ? `V${codeScanQuery?.data?.version}.0`
          : "--",
      },
      { label: "Repository type", value: codeScanQuery?.data?.repo_type },
      { label: "Branch name", value: codeScanQuery?.data?.branch_name },
      {
        label: "Initiated Time",
        value: codeScanQuery?.data?.initiated_time
          ? new Date(codeScanQuery?.data?.initiated_time)?.toUTCString()
          : "--",
      },
      {
        label: "Last Scanned Time",
        value: codeScanQuery?.data?.last_scanned_time
          ? new Date(codeScanQuery?.data?.last_scanned_time)?.toUTCString()
          : "--",
      },
    ];
  }, [codeScanQuery?.data, repositoryList, service_env_id]);
 
  // Fils analysed data
  const filesAnalysedData: FileData[] = useMemo(() => {
    const fileData: Record<string, "SUCCESS" | "RUNNING"> = {};
 
    fetchCodeQuery?.data?.forEach((file) => {
      if (
        codeScanQuery?.data?.status !== "RUNNING" &&
        codeScanQuery?.data?.status !== "PROCESSED"
      ) {
        fileData[file.file_path] = "SUCCESS";
      } else {
        if (
          Object.prototype.hasOwnProperty.call(fileData, file?.file_path) &&
          !file.remediatedImplementation
        ) {
          fileData[file.file_path] = "RUNNING";
        } else {
          fileData[file.file_path] = file?.remediatedImplementation
            ? "SUCCESS"
            : "RUNNING";
        }
      }
    });
 
    return Object.keys(fileData).map((file) => {
      return {
        fileName: file.split("/")?.pop(),
        scanStatus: fileData[file],
      };
    });
  }, [fetchCodeQuery?.data, codeScanQuery?.data]);
 
  const percentageCompleted = useMemo(() => {
    if (!fetchCodeQuery?.data?.length) return 0;
    return Math.floor(
      (fetchCodeQuery?.data?.filter((file) => file?.remediatedImplementation)
        ?.length /
        fetchCodeQuery?.data?.length) *
        100,
    );
  }, [fetchCodeQuery?.data]);
 
  useEffect(() => {
    if (
      percentageCompleted === 100 &&
      service_env_id &&
      selectedVersion &&
      codeScanQuery?.data?.status === "RUNNING"
    ) {
      codeScanQuery.refetch();
      latestVersionData?.refetch();
    }
  }, [
    percentageCompleted,
    codeScanQuery?.data?.status,
    service_env_id,
    selectedVersion,
  ]);
 
  useEffect(() => {
    if (totalVersions && totalVersions?.length) {
      setSelectedVersion(
        parseInt(totalVersions[totalVersions.length - 1].value.toString()),
      );
    }
  }, [totalVersions]);
 
  // Use record.doc_id instead of index
  const columns = [
    {
      title: "Function",
      dataIndex: "functionName",
      key: "function",
      width: "25%",
      render: (name: string, record) => (
        <Text
          text={name}
          type="footnote"
          weight="semibold"
          customClass="cursor-pointer"
          onClick={() => {
            setIsAntiPatternDrawerOpen(true);
            setSelectedAntiPatternId(record.doc_id);
          }}
        />
      ),
    },
    {
      title: "Anti-Patterns",
      dataIndex: "antipatterns",
      render: (antiPatterns: string[]) => (
        <Flex align="center" gap={Metrics.SPACE_XXS} wrap>
          {antiPatterns.slice(0, 3).map((antiPattern) => (
            <Tag key={antiPattern} className="antipattern-tag semibold">
              {antiPattern}
            </Tag>
          ))}
          {antiPatterns.length > 3 && (
            <Tag className="antipattern-tag semibold">
              +{antiPatterns.length - 3}
            </Tag>
          )}
        </Flex>
      ),
    },
    {
      title: "Actions",
      dataIndex: "isActionTaken",
      width: "10%",
      render: (resolved: boolean, record) =>
        resolved ? (
          <Button
            type="text"
            title="Applied"
            customClass="published-btn-container semibold"
            size="middle"
            onClick={() => handleUpdateAction(false, record.doc_id)}
            disabled={fetchCodeQuery?.isLoading || updateActionQuery?.isLoading}
          />
        ) : (
          <Button
            title="Mark it as Applied"
            size="middle"
            onClick={() => handleUpdateAction(true, record.doc_id)}
            disabled={fetchCodeQuery?.isLoading || updateActionQuery?.isLoading}
          />
        ),
    },
  ];
 
  /**
   * Handles the update action for a given code scan doc_id.
   *
   * @param {boolean} isActionTaken - The new value of isActionTaken
   * @param {string} doc_id - The id of the code scan doc
   */
  const handleUpdateAction = async (isActionTaken: boolean, doc_id: string) => {
    try {
      const req: UpdateActionRequest = {
        doc_id,
        isActionTaken,
      };
      await updateActionQuery.mutateAsync(req);
 
      await fetchCodeQuery.refetch();
    } catch (error) {
      console.error(error);
    }
  };
 
  /**
   * Resets the configure repositories form and opens the add new repository drawer.
   */
  const openAddNewRepository = () => {
    configureRepositoriesForm.resetFields();
    setIsRepositoryDrawerOpen(true);
    setRepositoryDrawerType("new");
  };
 
  /**
   * Handles the add new repository action by validating the form and cloning a repository
   * The cloned repository is added to the application and the application details are refetched
   * The repository drawer is closed upon completion
   */
  const handleAddNewRepository = async () => {
    try {
      await configureRepositoriesForm.validateFields();
 
      const req: CloneRepoRequest = {
        name: configureRepositoriesForm.getFieldValue(NAME.NAME),
        app_service_id: await getServiceId("Repositories"),
        branch: configureRepositoriesForm.getFieldValue(BRANCH_NAME.NAME),
        github_integration_id: configureRepositoriesForm.getFieldValue(
          REPOSITORY_URL.NAME,
        ),
        aws_integration_id: configureRepositoriesForm.getFieldValue(
          AWS_ACCOUNT.NAME,
        ),
      };
 
      await cloneRepoQuery.mutateAsync(req);
 
      const data: ApplicationDetails = await refetchApplicationDetails();
 
      if (data) {
        const environments: Environment[] =
          data?.services?.find((service) => service.service === "Repository")
            ?.environments || [];
 
        if (environments && environments?.length) {
          navigate(
            resolveUrlParams(RouteUrl.APPLICATIONS.CODE_HYGIENCE_STANDARDS, {
              application: application.id.toString(),
            }) + `?view=${environments?.pop().id}`,
          );
        }
      }
 
      setIsRepositoryDrawerOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
 
  /**
   * Handles the rescan action by refetching the scan data and updating the selected version.
   * Closes the confirmation modal upon completion.
   */
  const handleRescan = async () => {
    try {
      await rescanQuery.mutateAsync(service_env_id);
 
      await totalVersionsQuery.refetch();
 
      setIsConfirmModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
 
  /**
   * Handles the run scan action by calling the analyze repo mutation and refetching the code scan data.
   * Catches any errors that may occur during the mutation and logs them to the console.
   */
  const handleRunScan = async () => {
    try {
      await analyzeCodeQuery.mutateAsync(service_env_id);
 
      await codeScanQuery.refetch();
    } catch (err) {
      console.error(err);
    }
  };
 
  return (
    <>
      {codeScanQuery?.isLoading && <Loading />}
      {repositoryList?.length === 0 ? (
        <Empty
          title="You have not added any repository yet."
          subtitle="Please click “Add New Repository” button to get stated with."
        >
          <Button
            title={`Add New Repository`}
            icon={
              <IconViewer
                Icon={PlusOutlined}
                color={Colors.WHITE}
                size={Metrics.SPACE_MD}
              />
            }
            size="middle"
            onClick={openAddNewRepository}
          />
        </Empty>
      ) : (
        <>
          <ViewSelector
            type="Repositories"
            onClickAddNew={() => {
              if (repositoryList?.length === 5) setIsOpenRepoLimitModal(true);
              else setIsRepositoryDrawerOpen(true);
            }}
            onChange={() => {
              {
                /* TODO: Add handler to fetch details of repository selected */
              }
            }}
            views={repositoryList}
          />
          <Flex
            vertical
            gap={Metrics.SPACE_MD}
            className="application-codescan-container"
          >
            <Flex align="center" justify="space-between">
              <Select
                options={totalVersions}
                value={selectedVersion}
                onSelect={(value) => setSelectedVersion(value)}
              />
              <Flex align="center" gap={Metrics.SPACE_MD}>
                {codeScanQuery?.data?.status !== "PENDING" && (
                  <Button
                    title="Re-scan"
                    size="middle"
                    icon={
                      <IconViewer
                        Icon={CaretRightOutlined}
                        color={Colors.WHITE}
                        width={10}
                      />
                    }
                    metaTitle={
                      codeScanQuery?.data?.status === "PROCESSED" ||
                      codeScanQuery?.data?.status === "RUNNING"
                        ? "Scan in progress for current version"
                        : latestVersionData?.data?.status === "PROCESSED" ||
                            latestVersionData?.data?.status === "RUNNING"
                          ? "Scan in progress for the latest version"
                          : null
                    }
                    onClick={() => setIsConfirmModalOpen(true)}
                    disabled={
                      latestVersionData?.data?.status === "RUNNING" ||
                      latestVersionData?.data?.status === "PROCESSED" ||
                      codeScanQuery?.data?.status === "PROCESSED" ||
                      codeScanQuery?.data?.status === "RUNNING" ||
                      codeScanQuery?.isLoading ||
                      latestVersionData?.isLoading
                    }
                  />
                )}
              </Flex>
            </Flex>
            <Flex vertical gap={0}>
              <ScanOverview
                details={detailsData}
                scanStatus={
                  codeScanQuery?.data?.status === "FAILED"
                    ? "interrupted"
                    : codeScanQuery?.data?.status === "PROCESSED" ||
                        codeScanQuery?.data?.status === "RUNNING"
                      ? percentageCompleted
                        ? percentageCompleted
                        : "inprogress"
                      : codeScanQuery?.data?.status === "SUCCESS"
                        ? "completed"
                        : codeScanQuery?.data?.status === "PENDING"
                          ? "notStarted"
                          : "notStarted"
                }
                downloadReport={() => {}}
                restartScan={() => setIsConfirmModalOpen(true)}
              />
            </Flex>
            {codeScanQuery?.data?.status == "PENDING" ? (
              <RunScans
                loading={analyzeCodeQuery.isLoading || codeScanQuery.isLoading}
                onRunScans={handleRunScan}
              />
            ) : (
              <>
                <Row
                  className="summary-container"
                  gutter={[16, 16]}
                  justify="space-around"
                >
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
                <FilesAnalysed files={filesAnalysedData} />
                {codeScanQuery?.data?.status !== "PROCESSED" &&
                  codeScanQuery?.data?.status !== "RUNNING" && (
                    <Flex vertical gap={Metrics.SPACE_XS}>
                      <Flex justify="space-between">
                        <Text
                          text={`Anti Patterns Identified (${fetchCodeQuery?.data?.length || 0})`}
                          type="cardtitle"
                          weight="semibold"
                        />
                        <Flex gap={Metrics.SPACE_XXS} align="center">
                          <IconViewer
                            Icon={InfoCircleOutlined}
                            color={Colors.COOL_GRAY_2}
                          />
                          <Text
                            text="Only 50 anti-patterns can be remediated per scan."
                            type="footnote"
                            weight="semibold"
                            color={Colors.COOL_GRAY_6}
                          />
                        </Flex>
                      </Flex>
 
                      <Table<FetchCodeScanResponse>
                        dataSource={fetchCodeQuery?.data}
                        columns={columns}
                        loading={fetchCodeQuery?.isLoading}
                      />
                    </Flex>
                  )}
              </>
            )}
          </Flex>
        </>
         
      )}
      <Drawer
        title={
          repositoryDrawerType === "new"
            ? "Add New Repositories"
            : "Edit Repository"
        }
        open={isRepositoryDrawerOpen}
        onClose={() => setIsRepositoryDrawerOpen(false)}
        onCancel={() => setIsRepositoryDrawerOpen(false)}
        onSubmit={handleAddNewRepository}
        disabled={disabledSave}
        loading={cloneRepoQuery.isLoading || isLoading}
      >
        <ConfigureRepositories
          setDisabledSave={setDisabledSave}
          configureRepositoriesForm={configureRepositoriesForm}
          application_id={application?.id?.toString()}
        />
      </Drawer>
      <Drawer
        title={
          fetchCodeQuery?.data?.find(item => item.doc_id === selectedAntiPatternId)?.functionName
        }
        open={isAntiPatterDrawerOpen}
        onClose={() => setIsAntiPatternDrawerOpen(false)}
        onCancel={() => setIsAntiPatternDrawerOpen(false)}
        onSubmit={() => setIsAntiPatternDrawerOpen(false)}
        width={850}
        disabled={fetchCodeQuery?.isLoading}
        submitButtonText="Done"
      >
        <AntiPattern
          selectedAntiPattern={
            fetchCodeQuery?.data?.find(item => item.doc_id === selectedAntiPatternId)
          }
          handleUpdateAction={handleUpdateAction}
          loadingUpdateAction={fetchCodeQuery?.isLoading || updateActionQuery?.isLoading}
        />
      </Drawer>
      <ConfirmationModal
        loading={rescanQuery.isLoading || totalVersionsQuery.isLoading}
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
              {Number(totalVersions?.[totalVersions?.length - 1]?.value) + 1}.0
            </strong>
            .
          </span>
        }
        okText="Start Diagnostics"
        centered
      />
      <ConfirmationModal
        open={isOpenRepoLimitModal}
        title="Code Repo Limit"
        message={
          repositoryList?.length <= 1
            ? "Before you start, please remember that, you can only add 5 code repositories for this application."
            : "Repo limit of 5 has been reached"
        }
        okText="Okay"
        centered
        width={400}
        onCancel={() => setIsOpenRepoLimitModal(false)}
        onConfirm={() => setIsOpenRepoLimitModal(false)}
      />
    </>
  );
};
 
export default ApplicationCodescan;
 
 