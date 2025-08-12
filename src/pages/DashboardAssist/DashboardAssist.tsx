import React, { useState } from "react";
import {
  useGenerateDashboard,
  useUploadDashboard,
  useGetDashboardHistory,
} from "react-query/dashboardAssistQueries";
import "./DashboardAssist.styles.scss";
import { HistoryItem } from "interfaces/dashboardAssist";
import {
  CloseOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

interface DashboardAssistProps {
  onClose?: () => void;
}

const Loader: React.FC<{ message?: string }> = ({ message }) => (
  <div className="dashboard-loader">
    <span className="loader-spinner" />
    {message && <span style={{ marginLeft: 12 }}>{message}</span>}
  </div>
);

const DashboardView: React.FC<{
  item: HistoryItem;
  onBack: () => void;
}> = ({ item, onBack }) => (
  <div className="dashboard-view-container">
    <button className="dashboard-view-back-btn" onClick={onBack}>
      <ArrowLeftOutlined style={{ fontSize: 18, marginRight: 8 }} />
      Back to History
    </button>
    <div className="dashboard-view-prompt">
      <span className="dashboard-view-label">Prompt:</span>
      <span className="dashboard-view-prompt-text">{item.prompt}</span>
    </div>
    <div className="dashboard-view-iframe-wrapper" style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12, fontWeight: 600 }}>Dashboard:</div>
      <iframe
        src={item.dashboard_url || item.grafana_url}
        title={`Dashboard-${item.id}`}
        width="100%"
        height="600"
        style={{
          border: "1px solid #E0E3EB",
          borderRadius: 8,
          background: "#fff",
        }}
      />
    </div>
    {item.panel_links && item.panel_links.length > 0 && (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Panels:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {item.panel_links.map(
            (panelUrl, idx) =>
              panelUrl && (
                <iframe
                  key={idx}
                  src={panelUrl}
                  title={`Panel-${idx + 1}`}
                  width="400"
                  height="300"
                  style={{
                    border: "1px solid #E0E3EB",
                    borderRadius: 8,
                    background: "#fff",
                  }}
                />
              )
          )}
        </div>
      </div>
    )}
  </div>
);

const DashboardAssist: React.FC<DashboardAssistProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [panelLinks, setPanelLinks] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(
    null
  );

  const {
    mutateAsync: generateDashboard,
    isLoading: isGenerating,
    isError: isGenError,
    error: genError,
  } = useGenerateDashboard();

  const {
    mutateAsync: uploadDashboard,
    isLoading: isUploading,
    isError: isUploadError,
    error: uploadError,
  } = useUploadDashboard();

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
    refetch: refetchHistory,
  } = useGetDashboardHistory();

  const handlePromptSent = async () => {
    if (!prompt.trim()) return;
    setDashboardUrl(null);
    setPanelLinks([]);
    try {
      const genResponse = await generateDashboard({ prompt, preview: false });
      const uploadResponse = await uploadDashboard({
        prompt,
        dashboard: genResponse,
      });
      setDashboardUrl(
        uploadResponse.dashboard_url ||
          uploadResponse.grafana_url ||
          null
      );
      setPanelLinks(
        Array.isArray(uploadResponse.panel_links)
          ? uploadResponse.panel_links
          : []
      );
      setPrompt("");
      refetchHistory();
    } catch (e) {}
  };

  const HistoryCard: React.FC<{ item: HistoryItem }> = ({ item }) => (
    <div className="history-card">
      <div className="history-card-header">
        <span className="history-card-id">#{item.id}</span>
        <span className="history-card-date">
          {new Date(item.created_at).toLocaleString()}
        </span>
      </div>
      <div className="history-card-prompt">{item.prompt}</div>
      <button
        className="history-card-view-btn"
        title="View Dashboard"
        onClick={() => setSelectedHistory(item)}
      >
        <EyeOutlined style={{ fontSize: 18 }} />
        <span style={{ marginLeft: 8 }}>View</span>
      </button>
    </div>
  );

  return (
    <div
      className="dashboard-assist-container"
      style={{ minHeight: "100vh", overflowY: "auto" }}
    >
      {onClose && (
        <button
          className="dashboard-assist-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseOutlined style={{ fontSize: 20 }} />
        </button>
      )}

      {selectedHistory ? (
        <DashboardView
          item={selectedHistory}
          onBack={() => setSelectedHistory(null)}
        />
      ) : (
        <>
          <div className="dashboard-input-row">
            <input
              className="dashboard-input"
              type="text"
              value={prompt}
              placeholder="Enter your prompt"
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePromptSent();
              }}
              disabled={isGenerating || isUploading}
            />
            <button
              className="send-btn"
              onClick={handlePromptSent}
              disabled={isGenerating || isUploading || !prompt.trim()}
            >
              {isGenerating || isUploading ? <Loader /> : "Send Prompt"}
            </button>
          </div>

          {isGenError && (
            <div className="dashboard-error">
              {typeof genError === "string"
                ? genError
                : "Failed to generate dashboard."}
            </div>
          )}
          {isUploadError && (
            <div className="dashboard-error">
              {typeof uploadError === "string"
                ? uploadError
                : "Failed to upload dashboard."}
            </div>
          )}

          {(isGenerating || isUploading) && (
            <Loader
              message={
                isGenerating
                  ? "Generating dashboard..."
                  : "Uploading dashboard..."
              }
            />
          )}

          {dashboardUrl && (
            <div style={{ marginTop: 32 }}>
              <div style={{ marginBottom: 12, fontWeight: 600 }}>
                Generated Dashboard:
              </div>
              <iframe
                src={dashboardUrl}
                title="Generated Dashboard"
                width="100%"
                height="600"
                style={{
                  border: "1px solid #E0E3EB",
                  borderRadius: 8,
                  background: "#fff",
                }}
              />
              {panelLinks.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    Panels:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 16,
                    }}
                  >
                    {panelLinks.map(
                      (panelUrl, idx) =>
                        panelUrl && (
                          <iframe
                            key={idx}
                            src={panelUrl}
                            title={`Panel-${idx + 1}`}
                            width="400"
                            height="300"
                            style={{
                              border: "1px solid #E0E3EB",
                              borderRadius: 8,
                              background: "#fff",
                            }}
                          />
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="history-section" style={{ marginTop: 40 }}>
            <h3 style={{ textAlign: "center" }}>Dashboard History</h3>
            {isHistoryLoading && <Loader message="Loading history..." />}
            {isHistoryError && (
              <div className="dashboard-error">
                {typeof historyError === "string"
                  ? historyError
                  : "Failed to load history."}
              </div>
            )}
            {Array.isArray(historyData) && historyData.length > 0 ? (
              <div className="history-card-list">
                {historyData.map((item: HistoryItem) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              !isHistoryLoading && (
                <div
                  className="dashboard-empty"
                  style={{ textAlign: "center" }}
                >
                  No history found.
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAssist;
