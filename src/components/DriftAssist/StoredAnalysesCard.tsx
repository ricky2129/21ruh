import React from "react";
import { 
  Card, 
  Button, 
  Alert, 
  Typography, 
  Spin,
  Empty
} from "antd";
import {
  HistoryOutlined,
  CloseOutlined,
  DatabaseOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useListStoredAnalyses, type StoredAnalysisItem } from "react-query/driftAssistQueries";

const { Title, Text } = Typography;

interface StoredAnalysesCardProps {
  projectId: string;
  applicationId: string;
  onSelectAnalysis: (analysisId: number) => void;
  onClose: () => void;
}

const StoredAnalysesCard: React.FC<StoredAnalysesCardProps> = ({
  projectId,
  applicationId,
  onSelectAnalysis,
  onClose
}) => {
  const { data: analyses, isLoading, error } = useListStoredAnalyses(projectId, applicationId);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card style={{ 
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      border: '1px solid #f0f0f0',
      marginBottom: 32,
      background: 'white'
    }}>
      {/* Header matching existing pattern */}
      <div style={{ 
        padding: '24px 32px',
        borderBottom: '1px solid #f0f0f0',
        background: '#f8f9fa',
        borderRadius: '12px 12px 0 0',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <HistoryOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div>
              <Title level={3} style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>
                Stored Analyses
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                View previously completed drift analyses
              </Text>
            </div>
          </div>
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={onClose}
            style={{ color: '#8c8c8c' }}
          />
        </div>
      </div>

      <div style={{ padding: '0 32px 32px 32px' }}>
        {/* Loading state */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>Loading stored analyses...</div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Alert
            message="Failed to load stored analyses"
            description={error instanceof Error ? error.message : 'Unknown error occurred'}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Empty state */}
        {analyses && analyses.analyses.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px dashed #d9d9d9'
          }}>
            <Empty
              image={<DatabaseOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
              description={
                <div>
                  <Title level={4} style={{ color: '#8c8c8c', marginBottom: 8 }}>No Stored Analyses</Title>
                  <Text type="secondary">
                    Complete a drift analysis to see stored results here
                  </Text>
                </div>
              }
            />
          </div>
        )}

        {/* Analyses list */}
        {analyses && analyses.analyses.length > 0 && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16, color: '#262626' }}>
                Found {analyses.analyses.length} stored analysis{analyses.analyses.length !== 1 ? 'es' : ''}
              </Text>
            </div>
            
            <div style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid #f0f0f0',
              borderRadius: 8
            }}>
              {analyses.analyses.map((analysis: StoredAnalysisItem, index: number) => (
                <div 
                  key={analysis.analysis_id}
                  style={{ 
                    padding: '16px 20px',
                    borderBottom: index < analyses.analyses.length - 1 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => onSelectAnalysis(analysis.analysis_id)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: '#262626', 
                        marginBottom: 4,
                        fontSize: 16
                      }}>
                        Analysis #{analysis.analysis_id}
                      </div>
                      <div style={{ 
                        color: '#8c8c8c', 
                        fontSize: 14
                      }}>
                        Created: {formatDate(analysis.created_at)}
                      </div>
                    </div>
                    <RightOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StoredAnalysesCard;
