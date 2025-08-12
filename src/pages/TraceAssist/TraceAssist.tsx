import React, { useState, useEffect, useRef } from "react";
import { Steps, Button, Drawer, Form, Tabs, Input, Modal, message, Spin } from "antd";
import {
  CloudDownloadOutlined,
  ToolOutlined,
  RocketOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { ConfigureTraceAssist } from "components/ConfigureTraceAssist";
import {
  useGetAllDeployments,
  useGetDeploymentDetails,
  useInstrumentDeployment,
} from "react-query/traceAssistQueries";
import moment from "moment-timezone";
import "./TraceAssist.styles.scss";

const TraceAssist = ({ onClose }) => {
  const [showConfigure, setShowConfigure] = useState(false);
  const [current, setCurrent] = useState(0);
  const [configureTraceAssistForm] = Form.useForm();
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [patToken, setPatToken] = useState("");
  const [showPatModal, setShowPatModal] = useState(false);

  const { data: deployments, isLoading: isLoadingDeployments } = useGetAllDeployments();
  const { data: deploymentDetails, isLoading: isLoadingDeploymentDetails } = useGetDeploymentDetails(selectedDeployment);

  const {
    mutateAsync: instrumentDeploymentAsync,
    isLoading: isInstrumenting,
    isError: isInstrumentError,
    error: instrumentError,
  } = useInstrumentDeployment();

  const stepTimerRef = useRef(null);

  const steps = [
    {
      title: "Cloning Repo",
      description: "Cloning repository",
      icon: <CloudDownloadOutlined />,
    },
    {
      title: "Instrumenting",
      description: "Instrumenting application",
      icon: <ToolOutlined />,
    },
    {
      title: "Deployed",
      description: "Deploying into cluster",
      icon: <RocketOutlined />,
    },
  ];

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return moment(dateTime)
      .tz("Asia/Kolkata")
      .format("ddd, DD MMM YYYY HH:mm:ss [IST]");
  };

  const isDeployed = deploymentDetails?.status?.toLowerCase() === "deployed";

  useEffect(() => {
    if (deployments && deployments.length > 0 && !selectedDeployment) {
      setSelectedDeployment(deployments[0].deployment_name);
    }
  }, [deployments, selectedDeployment]);

  useEffect(() => {
    if (isDeployed) {
      setCurrent(2);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    }
  }, [deploymentDetails?.status]);

  useEffect(() => {
    if (!isDeployed) {
      setCurrent(0);
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    }
  }, [selectedDeployment, showPatModal, deploymentDetails?.status]);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
    };
  }, []);

  const handleStartInstrumentation = async () => {
    setCurrent(0);

    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    stepTimerRef.current = setTimeout(() => {
      setCurrent(1);
    }, 15000);

    const tokenToUse = deploymentDetails?.pat_token || patToken;
    if (!tokenToUse) {
      setShowPatModal(true);
      return;
    }
    if (selectedDeployment) {
      try {
        await instrumentDeploymentAsync({
          deploymentName: selectedDeployment,
          pat_token: tokenToUse,
        });
        if (current === 0) {
          setCurrent(1);
          setTimeout(() => setCurrent(2), 500);
        } else {
          setCurrent(2);
        }
        message.success("Instrumentation started successfully!");
      } catch (error) {
        message.error("Failed to start instrumentation.");
        setCurrent(0);
      }
    }
  };

  const handlePatModalOk = async () => {
    setShowPatModal(false);
    setCurrent(0);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    stepTimerRef.current = setTimeout(() => {
      setCurrent(1);
    }, 15000);

    if (selectedDeployment && patToken) {
      try {
        await instrumentDeploymentAsync({
          deploymentName: selectedDeployment,
          pat_token: patToken,
        });
        if (current === 0) {
          setCurrent(1);
          setTimeout(() => setCurrent(2), 500);
        } else {
          setCurrent(2);
        }
        message.success("Instrumentation started successfully!");
      } catch (error) {
        message.error("Failed to start instrumentation.");
        setCurrent(0);
      }
    }
  };

  const getLastUpdated = () => {
    if (deploymentDetails?.last_updated) {
      return deploymentDetails.last_updated;
    }
    return deploymentDetails?.created_at || null;
  };

  const dashboardUrls = React.useMemo(() => {
    if (!deploymentDetails?.grafana_panel_links) return [];
    try {
      const urls = JSON.parse(deploymentDetails.grafana_panel_links);
      return Array.isArray(urls) ? urls : [];
    } catch {
      return [];
    }
  }, [deploymentDetails?.grafana_panel_links]);

  const isAnyLoading = isLoadingDeployments || isLoadingDeploymentDetails;

  return (
    <div className="trace-assist-container">
      <Button
        icon={<CloseOutlined />}
        onClick={onClose}
        className="close-button"
      />

      <div className="header">
        <div className="tabs-scroll-wrapper">
          <Tabs
            activeKey={selectedDeployment}
            onChange={setSelectedDeployment}
            className="tabs"
            tabBarGutter={8}
            tabBarStyle={{ marginBottom: 0 }}
          >
            {deployments?.map((deployment) => (
              <Tabs.TabPane
                tab={deployment.deployment_name}
                key={deployment.deployment_name}
              />
            ))}
          </Tabs>
        </div>
        <Button
          type="primary"
          onClick={() => setShowConfigure(true)}
          className="add-button"
        >
          + Add New Application
        </Button>
      </div>

      <div className="instrumentation-button">
        <Button
          className="start-button"
          onClick={handleStartInstrumentation}
          loading={isInstrumenting}
          disabled={!selectedDeployment}
        >
          <ToolOutlined className="icon" />
          Start Instrumentation
        </Button>
      </div>

      <Spin spinning={isAnyLoading}>
        <div className="data-box">
          <div className="data-row">
            <div className="data-label">ID</div>
            <div className="data-value">{deploymentDetails?.id || "N/A"}</div>
          </div>
          <div className="data-row">
            <div className="data-label">Deployment Name</div>
            <div className="data-value">{deploymentDetails?.deployment_name || "N/A"}</div>
          </div>
          <div className="data-row repo-url-row">
            <div className="data-label">Repository URL</div>
            <div className="data-value">{deploymentDetails?.repo_url || "N/A"}</div>
          </div>
          <div className="data-row">
            <div className="data-label">Created At</div>
            <div className="data-value">{formatDateTime(deploymentDetails?.created_at)}</div>
          </div>
          <div className="data-row">
            <div className="data-label">Last Updated</div>
            <div className="data-value">{formatDateTime(getLastUpdated())}</div>
          </div>
          <div className="data-row">
            <div className="data-label">Status</div>
            <div className="data-value">
              {isDeployed ? (
                <span className="status-completed">
                  <CheckCircleOutlined /> Deployed
                </span>
              ) : (
                deploymentDetails?.status || "N/A"
              )}
            </div>
          </div>
        </div>

        {!isAnyLoading && (
          <Steps
            current={current}
            size="small"
            className="steps"
            onChange={setCurrent}
            items={steps.map((item) => ({
              key: item.title,
              title: item.title,
              description: item.description,
              icon: item.icon,
            }))}
          />
        )}
      </Spin>

      {isDeployed && (
        <div className="dashboard-grid">
          {dashboardUrls.length > 0 ? (
            dashboardUrls.map((url, idx) => (
              <iframe
                key={idx}
                src={url}
                title={`dashboard-${idx + 1}`}
                frameBorder="0"
                className="dashboard-iframe"
                style={{ width: "100%", height: "300px", margin: "10px 0" }}
                allowFullScreen
              />
            ))
          ) : (
            <div className="dashboard-placeholder">No dashboards available.</div>
          )}
        </div>
      )}

      <Drawer
        title="Add New Application"
        placement="right"
        onClose={() => setShowConfigure(false)}
        open={showConfigure}
        width={400}
        closeIcon={<CloseOutlined />}
        destroyOnClose
      >
        <ConfigureTraceAssist
          configureTraceAssistForm={configureTraceAssistForm}
          setDisabledSave={() => {}}
          onFinish={(values) => {
            setSelectedDeployment(values.deployment_name);
            setShowConfigure(false);
          }}
        />
      </Drawer>

      <Modal
        title="Enter Personal Access Token"
        open={showPatModal}
        onOk={handlePatModalOk}
        onCancel={() => setShowPatModal(false)}
        okText="Submit"
      >
        <Input.Password
          placeholder="Enter your PAT token"
          value={patToken}
          onChange={(e) => setPatToken(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default TraceAssist;
