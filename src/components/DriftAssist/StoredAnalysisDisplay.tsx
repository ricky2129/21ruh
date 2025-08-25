import React from "react";
import { 
  Card, 
  Button, 
  Alert, 
  Typography, 
  Spin
} from "antd";
import {
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useGetStoredAnalysis } from "react-query/driftAssistQueries";
import { UnifiedResultsDisplay } from "components/DriftAssist";

const { Title, Text } = Typography;

interface StoredAnalysisDisplayProps {
  projectId: string;
  applicationId: string;
  analysisId: number;
  onBack: () => void;
}

const StoredAnalysisDisplay: React.FC<StoredAnalysisDisplayProps> = ({
  projectId,
  applicationId,
  analysisId,
  onBack
}) => {
  const { data: analysisData, isLoading, error } = useGetStoredAnalysis(
    projectId, 
    applicationId, 
    analysisId, 
    true
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, fontSize: 16 }}>Loading analysis #{analysisId}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ borderRadius: 16, textAlign: 'center', padding: '40px' }}>
        <Alert
          message="Failed to load analysis"
          description={error instanceof Error ? error.message : 'Unknown error occurred'}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Button type="primary" onClick={onBack}>
          Back to Analysis List
        </Button>
      </Card>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div style={{ 
        margin: '24px 24px 0 24px', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Button
          type="default"
          size="large"
          onClick={onBack}
          icon={<ArrowLeftOutlined />}
          style={{ 
            borderRadius: 8,
            fontWeight: 500
          }}
        >
          Back to Stored Analyses
        </Button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
              Analysis #{analysisId}
            </div>
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>
              {analysisData?.completed_at ? 
                `Completed: ${formatDate(analysisData.completed_at)}` :
                'Stored Analysis'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Reuse existing UnifiedResultsDisplay component */}
      {analysisData && (
        <UnifiedResultsDisplay
          data={analysisData}
          onReset={onBack}
          apiBaseUrl={(import.meta as any).env?.VITE_DRIFT_ASSIST_URL || 'http://localhost:8004'}
          isStoredAnalysis={true}
          analysisMetadata={{
            analysis_id: analysisId,
            project_id: projectId,
            application_id: applicationId,
            completed_at: analysisData.completed_at
          }}
        />
      )}
    </div>
  );
};

export default StoredAnalysisDisplay;
