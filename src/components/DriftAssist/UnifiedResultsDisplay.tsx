import React, { useState, useMemo, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Alert, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Badge,
  Divider,
  Collapse,
  Tag
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  BarChartOutlined,
  BugOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  FileTextOutlined,
  LoadingOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Constants for report types and priorities
const REPORT_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

const PRIORITY_CONFIG = {
  [REPORT_PRIORITIES.HIGH]: {
    label: 'High Priority',
    icon: '🚨',
    color: '#dc2626',
    bgColor: 'rgb(220 38 38 / 0.1)',
    borderColor: 'rgb(220 38 38 / 0.2)',
    description: 'Critical issues requiring immediate attention'
  },
  [REPORT_PRIORITIES.MEDIUM]: {
    label: 'Medium Priority',
    icon: '⚠️',
    color: '#f59e0b',
    bgColor: 'rgb(245 158 11 / 0.1)',
    borderColor: 'rgb(245 158 11 / 0.2)',
    description: 'Important issues that should be addressed soon'
  },
  [REPORT_PRIORITIES.LOW]: {
    label: 'Low Priority',
    icon: '📋',
    color: '#8b5cf6',
    bgColor: 'rgb(139 92 246 / 0.1)',
    borderColor: 'rgb(139 92 246 / 0.2)',
    description: 'Minor issues for future consideration'
  }
};

// Legacy drift types for backward compatibility
const DRIFT_TYPES = {
  ORPHANED: 'orphaned',
  MISSING: 'missing',
  ATTRIBUTE: 'attribute',
  ERROR: 'error'
} as const;

const DRIFT_TYPE_CONFIG = {
  [DRIFT_TYPES.ORPHANED]: {
    label: 'Orphaned Resources',
    icon: '🔗',
    color: '#f59e0b',
    bgColor: 'rgb(245 158 11 / 0.1)',
    borderColor: 'rgb(245 158 11 / 0.2)',
    description: 'Resources that exist in the cloud but are not managed by your IaC'
  },
  [DRIFT_TYPES.MISSING]: {
    label: 'Missing Resources',
    icon: '❌',
    color: '#ef4444',
    bgColor: 'rgb(239 68 68 / 0.1)',
    borderColor: 'rgb(239 68 68 / 0.2)',
    description: 'Resources defined in IaC but not found in the cloud'
  },
  [DRIFT_TYPES.ATTRIBUTE]: {
    label: 'Configuration Drift',
    icon: '⚙️',
    color: '#8b5cf6',
    bgColor: 'rgb(139 92 246 / 0.1)',
    borderColor: 'rgb(139 92 246 / 0.2)',
    description: 'Resources with configuration differences between IaC and cloud'
  },
  [DRIFT_TYPES.ERROR]: {
    label: 'Analysis Errors',
    icon: '⚠️',
    color: '#dc2626',
    bgColor: 'rgb(220 38 38 / 0.1)',
    borderColor: 'rgb(220 38 38 / 0.2)',
    description: 'Errors encountered during drift analysis'
  }
};

interface UnifiedResultsDisplayProps {
  data: any;
  displayMode?: 'auto' | 'dashboard' | 'grouped' | 's3';
  onReset: () => void;
  onResourceSelect?: (resource: any) => void;
  apiBaseUrl?: string;
}

interface ProcessedItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  status?: string;
  error?: string;
  metadata?: any;
  analysisData?: any;
  hasError?: boolean;
  isReady?: boolean;
  resources?: any[];
  report?: any;
  drift?: any;
  driftType?: string;
  priority?: string;
  driftCount?: number;
  hasDrift?: boolean;
}

interface ProcessedStats {
  total: number;
  totalDrifts: number;
  successful?: number;
  failed?: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

const UnifiedResultsDisplay: React.FC<UnifiedResultsDisplayProps> = ({ 
  data, 
  displayMode = 'auto',
  onReset,
  onResourceSelect,
  apiBaseUrl = import.meta.env.VITE_DRIFT_ASSIST_URL || 'http://localhost:8001'
}) => {
  const [selectedType, setSelectedType] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['all']));
  const [pdfGenerationState, setPdfGenerationState] = useState<Record<string, any>>({});

  /**
   * Detect the data format and determine display mode
   */
  const detectedFormat = useMemo(() => {
    if (!data) return 'empty';
    
    // S3 analysis format
    if (data.type === 's3_bucket_analysis' || data.data?.bucket_name) {
      return 's3';
    }
    
    // Grouped streaming format
    if (typeof data === 'object' && !Array.isArray(data) && 
        Object.values(data).some((group: any) => group.resources)) {
      return 'grouped';
    }
    
    // Array of reports or drifts
    if (Array.isArray(data)) {
      if (data.length > 0 && data[0].drift_analysis) {
        return 'reports'; // New comprehensive report format
      }
      return 'legacy'; // Legacy drift format
    }
    
    return 'unknown';
  }, [data]);

  const effectiveDisplayMode = displayMode === 'auto' ? detectedFormat : displayMode;

  /**
   * Process data and extract statistics based on format
   */
  const processedData = useMemo(() => {
    if (!data) return { items: [], stats: { total: 0, totalDrifts: 0, byPriority: {}, byType: {} } };

    switch (effectiveDisplayMode) {
      case 's3':
        return processS3Data(data);
      case 'grouped':
        return processGroupedData(data);
      case 'reports':
        return processReportsData(data);
      case 'legacy':
        return processLegacyData(data);
      default:
        return { items: [], stats: { total: 0, totalDrifts: 0, byPriority: {}, byType: {} } };
    }
  }, [data, effectiveDisplayMode]);

  /**
   * Process S3 analysis data
   */
  function processS3Data(s3Data: any): { items: ProcessedItem[], stats: ProcessedStats } {
    const analysisResults = s3Data.data?.analysis_results || [];
    const items: ProcessedItem[] = analysisResults.map((fileResult: any, index: number) => ({
      id: `s3-${index}`,
      type: 's3_file',
      title: fileResult.file_name,
      subtitle: fileResult.file_key,
      status: fileResult.status,
      error: fileResult.error,
      metadata: {
        size: fileResult.size,
        lastModified: fileResult.last_modified,
        bucket: s3Data.data?.bucket_name
      },
      analysisData: fileResult.analysis_data,
      hasError: fileResult.status === 'error',
      isReady: fileResult.status === 'ready_for_analysis'
    }));

    const stats: ProcessedStats = {
      total: s3Data.data?.total_files || 0,
      totalDrifts: 0,
      successful: s3Data.data?.successful_analyses || 0,
      failed: s3Data.data?.failed_analyses || 0,
      byPriority: { [REPORT_PRIORITIES.HIGH]: 0, [REPORT_PRIORITIES.MEDIUM]: 0, [REPORT_PRIORITIES.LOW]: 0 },
      byType: {}
    };

    return { items, stats };
  }

  /**
   * Process grouped streaming data
   */
  function processGroupedData(groupedData: any): { items: ProcessedItem[], stats: ProcessedStats } {
    const items: ProcessedItem[] = [];
    const stats: ProcessedStats = {
      total: 0,
      totalDrifts: 0,
      byPriority: { [REPORT_PRIORITIES.HIGH]: 0, [REPORT_PRIORITIES.MEDIUM]: 0, [REPORT_PRIORITIES.LOW]: 0 },
      byType: {}
    };

    Object.entries(groupedData).forEach(([groupName, group]: [string, any]) => {
      if (!group.resources) return;

      const groupItem: ProcessedItem = {
        id: `group-${groupName}`,
        type: 'resource_group',
        title: groupName,
        subtitle: `${Object.keys(group.resources).length} resources`,
        status: getGroupStatus(group),
        resources: Object.entries(group.resources).map(([resourceName, resourceData]: [string, any]) => {
          stats.total++;
          const hasDrift = resourceData.drift_result?.has_drift;
          if (hasDrift) {
            stats.totalDrifts += resourceData.drift_result.drift_count || 1;
          }

          return {
            id: `resource-${groupName}-${resourceName}`,
            type: 'resource',
            title: resourceName,
            status: resourceData.status,
            driftResult: resourceData.drift_result,
            report: resourceData.report,
            explanation: resourceData.explanation,
            hasDrift,
            isNewReportFormat: resourceData.report && (resourceData.report.drift_analysis || resourceData.report.impact_assessment)
          };
        })
      };

      items.push(groupItem);
    });

    return { items, stats };
  }

  /**
   * Process new comprehensive reports data
   */
  function processReportsData(reportsData: any[]): { items: ProcessedItem[], stats: ProcessedStats } {
    const items: ProcessedItem[] = reportsData.map((report: any, index: number) => ({
      id: `report-${index}`,
      type: 'comprehensive_report',
      title: report.resource_id || report.resource_type || 'Unknown Resource',
      subtitle: 'Comprehensive Analysis Report',
      report,
      priority: report.remediation_guidance?.priority?.toLowerCase() || 'low',
      driftCount: report.drift_analysis?.drift_count || 0,
      hasDrift: (report.drift_analysis?.drift_count || 0) > 0
    }));

    const stats: ProcessedStats = {
      total: items.length,
      totalDrifts: items.reduce((sum, item) => sum + (item.driftCount || 0), 0),
      byPriority: { [REPORT_PRIORITIES.HIGH]: 0, [REPORT_PRIORITIES.MEDIUM]: 0, [REPORT_PRIORITIES.LOW]: 0 },
      byType: {}
    };

    items.forEach(item => {
      if (item.priority && stats.byPriority[item.priority] !== undefined) {
        stats.byPriority[item.priority]++;
      }
    });

    return { items, stats };
  }

  /**
   * Process legacy drift data
   */
  function processLegacyData(driftsData: any[]): { items: ProcessedItem[], stats: ProcessedStats } {
    const actualDrifts = driftsData.filter((drift: any) => drift.type !== 'debug_info');
    
    const items: ProcessedItem[] = actualDrifts.map((drift: any, index: number) => ({
      id: `drift-${index}`,
      type: 'legacy_drift',
      title: formatResourceName(drift.resource),
      subtitle: drift.type || 'Configuration Drift',
      drift,
      driftType: drift.type || 'error',
      priority: mapDriftTypeToPriority(drift.type)
    }));

    const stats: ProcessedStats = {
      total: items.length,
      totalDrifts: items.length,
      byType: {},
      byPriority: { [REPORT_PRIORITIES.HIGH]: 0, [REPORT_PRIORITIES.MEDIUM]: 0, [REPORT_PRIORITIES.LOW]: 0 }
    };

    // Initialize counters
    Object.keys(DRIFT_TYPES).forEach(type => {
      stats.byType[DRIFT_TYPES[type as keyof typeof DRIFT_TYPES]] = 0;
    });

    // Count drifts by type and priority
    items.forEach(item => {
      const type = item.driftType;
      if (type) {
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      }
      if (item.priority) {
        stats.byPriority[item.priority]++;
      }
    });

    return { items, stats };
  }

  /**
   * Helper functions
   */
  const getGroupStatus = (group: any) => {
    if (!group.resources || Object.keys(group.resources).length === 0) {
      return 'detecting';
    }

    const resourceStatuses = Object.values(group.resources).map((r: any) => r.status);
    
    if (resourceStatuses.every(status => status === 'completed')) {
      return 'completed';
    } else if (resourceStatuses.some(status => status === 'reporting')) {
      return 'reporting';
    } else if (resourceStatuses.some(status => status === 'detecting')) {
      return 'detecting';
    } else {
      return 'processing';
    }
  };

  const formatResourceName = (resource: any) => {
    if (Array.isArray(resource)) {
      return resource.filter(Boolean).join(' / ') || 'Unknown Resource';
    }
    return resource || 'Unknown Resource';
  };

  const mapDriftTypeToPriority = (driftType: string) => {
    switch (driftType) {
      case DRIFT_TYPES.MISSING:
      case DRIFT_TYPES.ERROR:
        return REPORT_PRIORITIES.HIGH;
      case DRIFT_TYPES.ORPHANED:
      case DRIFT_TYPES.ATTRIBUTE:
        return REPORT_PRIORITIES.MEDIUM;
      default:
        return REPORT_PRIORITIES.LOW;
    }
  };

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }, []);

  /**
   * Download data as JSON file
   */
  const downloadAsJson = useCallback((data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Download data as PDF report with enhanced UX
   */
  const downloadAsPdf = useCallback(async (data: any, resourceType: string, filename: string) => {
    const pdfKey = `${resourceType}_${filename}`;

    try {
      // Set initial PDF generation state
      setPdfGenerationState(prev => ({
        ...prev,
        [pdfKey]: {
          isGenerating: true,
          stage: 'preparing',
          progress: 0,
          message: '🔄 Preparing PDF generation...'
        }
      }));

      // Update progress during generation
      const updateProgress = (stage: string, progress: number, message: string) => {
        setPdfGenerationState(prev => ({
          ...prev,
          [pdfKey]: { ...prev[pdfKey], stage, progress, message }
        }));
      };

      updateProgress('generating', 25, '📄 Generating PDF report...');

      const response = await fetch(`${apiBaseUrl}/api/reports/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
          resource_type: resourceType,
          filename: filename,
          title: `Infrastructure Drift Report - ${resourceType}`,
          subtitle: `Analysis Results for ${filename}`
        })
      });

      updateProgress('processing', 75, '⚙️ Processing report data...');

      if (response.ok) {
        updateProgress('downloading', 100, '🎉 Report ready! Starting download...');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${resourceType}_drift_report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success state briefly
        setPdfGenerationState(prev => ({
          ...prev,
          [pdfKey]: {
            ...prev[pdfKey],
            stage: 'completed',
            progress: 100,
            message: '✅ PDF downloaded successfully!'
          }
        }));

        // Clear state after 3 seconds
        setTimeout(() => {
          setPdfGenerationState(prev => {
            const newState = { ...prev };
            delete newState[pdfKey];
            return newState;
          });
        }, 3000);

        console.log('🎉 PDF report downloaded successfully');
      } else {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('PDF download failed:', error);
      
      setPdfGenerationState(prev => ({
        ...prev,
        [pdfKey]: {
          ...prev[pdfKey],
          stage: 'error',
          progress: 0,
          message: '❌ PDF generation failed'
        }
      }));

      // Clear error state after 5 seconds
      setTimeout(() => {
        setPdfGenerationState(prev => {
          const newState = { ...prev };
          delete newState[pdfKey];
          return newState;
        });
      }, 5000);
    }
  }, [apiBaseUrl]);

  /**
   * Filter items based on selected type
   */
  const filteredItems = useMemo(() => {
    if (selectedType === 'all') {
      return processedData.items;
    }

    return processedData.items.filter(item => {
      if (effectiveDisplayMode === 'reports') {
        return item.priority === selectedType;
      } else if (effectiveDisplayMode === 'legacy') {
        return item.driftType === selectedType;
      }
      return true;
    });
  }, [processedData.items, selectedType, effectiveDisplayMode]);

  /**
   * Toggle item expansion
   */
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  /**
   * Render summary statistics
   */
  const renderSummary = () => {
    const { stats } = processedData;
    
    return (
      <Card style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
            Infrastructure Analysis Results
          </Title>
          <Text type="secondary">
            {effectiveDisplayMode === 's3' ? (
              <>S3 bucket analysis completed with {stats.successful} successful and {stats.failed} failed analyses</>
            ) : effectiveDisplayMode === 'grouped' ? (
              <>Real-time analysis processed {stats.total} resources with {stats.totalDrifts} drifts detected</>
            ) : effectiveDisplayMode === 'reports' ? (
              <>AI-powered analysis generated {stats.total} comprehensive reports covering {stats.totalDrifts} drifts</>
            ) : (
              <>Analysis detected {stats.total} drifts in your infrastructure</>
            )}
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} md={6}>
            <Card 
              size="small" 
              style={{ 
                textAlign: 'center',
                cursor: 'pointer',
                borderColor: selectedType === 'all' ? '#1890ff' : undefined
              }}
              onClick={() => setSelectedType('all')}
            >
              <div style={{ fontSize: '24px', marginBottom: 8 }}>📊</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 4 }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {effectiveDisplayMode === 's3' ? 'Total Files' : 
                 effectiveDisplayMode === 'grouped' ? 'Total Resources' :
                 effectiveDisplayMode === 'reports' ? 'Total Reports' : 'Total Drifts'}
              </div>
            </Card>
          </Col>

          {/* Render priority/type filters based on display mode */}
          {(effectiveDisplayMode === 'reports' || effectiveDisplayMode === 'grouped') && 
            Object.entries(PRIORITY_CONFIG).map(([priority, config]) => {
              const count = stats.byPriority[priority] || 0;
              if (count === 0) return null;

              return (
                <Col xs={24} sm={8} md={6} key={priority}>
                  <Card
                    size="small"
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderColor: selectedType === priority ? config.color : undefined,
                      backgroundColor: selectedType === priority ? config.bgColor : undefined
                    }}
                    onClick={() => setSelectedType(priority)}
                  >
                    <div style={{ fontSize: '24px', marginBottom: 8 }}>{config.icon}</div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      marginBottom: 4,
                      color: config.color 
                    }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {config.label}
                    </div>
                  </Card>
                </Col>
              );
            })
          }

          {effectiveDisplayMode === 'legacy' && 
            Object.entries(DRIFT_TYPE_CONFIG).map(([type, config]) => {
              const count = stats.byType[type] || 0;
              if (count === 0) return null;

              return (
                <Col xs={24} sm={8} md={6} key={type}>
                  <Card
                    size="small"
                    style={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderColor: selectedType === type ? config.color : undefined,
                      backgroundColor: selectedType === type ? config.bgColor : undefined
                    }}
                    onClick={() => setSelectedType(type)}
                  >
                    <div style={{ fontSize: '24px', marginBottom: 8 }}>{config.icon}</div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      marginBottom: 4,
                      color: config.color 
                    }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {config.label}
                    </div>
                  </Card>
                </Col>
              );
            })
          }
        </Row>
      </Card>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: 16 }}>🎉</div>
      <Title level={3}>No Infrastructure Drift Detected!</Title>
      <Paragraph>Your infrastructure is perfectly aligned with your IaC configuration.</Paragraph>
      <Button 
        type="primary" 
        icon={<ReloadOutlined />}
        onClick={onReset}
      >
        Run New Analysis
      </Button>
    </Card>
  );

  // Main render logic
  if (!data || processedData.stats.total === 0) {
    return renderEmptyState();
  }

  return (
    <div style={{ padding: '24px 0' }}>
      {renderSummary()}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>Analysis Details</Title>
          <Text type="secondary">
            {filteredItems.length} of {processedData.items.length} items shown
          </Text>
        </div>

        <Collapse 
          activeKey={Array.from(expandedItems)}
          onChange={(keys) => setExpandedItems(new Set(keys as string[]))}
          style={{ background: 'transparent' }}
        >
          {filteredItems.map((item, index) => (
            <Panel
              key={item.id}
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        fontSize: '20px',
                        color: item.priority ? PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.color : '#1890ff'
                      }}>
                        {item.priority ? PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.icon : 
                         item.driftType ? DRIFT_TYPE_CONFIG[item.driftType as keyof typeof DRIFT_TYPE_CONFIG]?.icon : '📋'}
                      </div>
                      <div>
                        <Title level={5} style={{ margin: 0, marginBottom: 2 }}>
                          {item.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14 }}>{item.subtitle}</Text>
                      </div>
                    </div>
                  </div>
                  
                  <Space onClick={(e) => e.stopPropagation()}>
                    {item.driftCount !== undefined && item.driftCount > 0 && (
                      <Tag color="orange" style={{ margin: 0 }}>
                        {item.driftCount} drift{item.driftCount !== 1 ? 's' : ''}
                      </Tag>
                    )}
                    {item.priority && (
                      <Tag 
                        color={PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.color}
                        style={{ margin: 0 }}
                      >
                        {item.priority.toUpperCase()}
                      </Tag>
                    )}
                    {item.status && (
                      <Badge 
                        status={item.hasError ? 'error' : item.isReady ? 'success' : 'processing'}
                        text={item.status}
                      />
                    )}
                    
                    {/* Download Actions */}
                    <Space.Compact>
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAsJson(item, `${item.title}_analysis.json`);
                        }}
                        title="Download JSON"
                      />
                      <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAsPdf(item, item.type, item.title);
                        }}
                        title="Download PDF Report"
                        loading={pdfGenerationState[`${item.type}_${item.title}`]?.isGenerating}
                      />
                    </Space.Compact>
                  </Space>
                </div>
              }
              style={{ 
                marginBottom: 16,
                border: `1px solid ${item.priority ? PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.borderColor : '#f0f0f0'}`,
                borderRadius: 8,
                background: item.priority ? PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.bgColor : 'white'
              }}
            >
              {/* Detailed Report Content */}
              <div style={{ padding: '16px 0' }}>
                {/* Error Display */}
                {item.error && (
                  <Alert
                    message="Analysis Error"
                    description={item.error}
                    type="error"
                    style={{ marginBottom: 16 }}
                    showIcon
                  />
                )}

                {/* PDF Generation Status */}
                {pdfGenerationState[`${item.type}_${item.title}`] && (
                  <Alert
                    message={pdfGenerationState[`${item.type}_${item.title}`].message}
                    type={pdfGenerationState[`${item.type}_${item.title}`].stage === 'error' ? 'error' : 'info'}
                    style={{ marginBottom: 16 }}
                    showIcon
                    icon={pdfGenerationState[`${item.type}_${item.title}`].stage === 'error' ? 
                      <BugOutlined /> : <LoadingOutlined spin />}
                  />
                )}

                {/* S3 File Details */}
                {item.type === 's3_file' && (
                  <div>
                    <Title level={5} style={{ marginBottom: 12 }}>📁 File Information</Title>
                    <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                      <Col span={8}>
                        <Text strong>File Size:</Text>
                        <div>{item.metadata?.size ? formatFileSize(item.metadata.size) : 'Unknown'}</div>
                      </Col>
                      <Col span={8}>
                        <Text strong>Last Modified:</Text>
                        <div>{item.metadata?.lastModified ? formatDate(item.metadata.lastModified) : 'Unknown'}</div>
                      </Col>
                      <Col span={8}>
                        <Text strong>S3 Bucket:</Text>
                        <div>{item.metadata?.bucket || 'Unknown'}</div>
                      </Col>
                    </Row>
                    
                    {item.analysisData && (
                      <div>
                        <Title level={5} style={{ marginBottom: 12 }}>🔍 Analysis Data</Title>
                        <Card size="small" style={{ background: '#fafafa' }}>
                          <pre style={{ 
                            margin: 0, 
                            fontSize: 12, 
                            maxHeight: 300, 
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {JSON.stringify(item.analysisData, null, 2)}
                          </pre>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {/* Comprehensive Report Details */}
                {item.type === 'comprehensive_report' && item.report && (
                  <div>
                    {/* Drift Analysis Section */}
                    {item.report.drift_analysis && (
                      <div style={{ marginBottom: 24 }}>
                        <Title level={5} style={{ marginBottom: 12 }}>
                          <SecurityScanOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                          Drift Analysis
                        </Title>
                        <Card size="small" style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
                          <Row gutter={[16, 8]}>
                            <Col span={8}>
                              <Text strong>Drift Count:</Text>
                              <div style={{ fontSize: 18, color: '#fa8c16' }}>
                                {item.report.drift_analysis.drift_count || 0}
                              </div>
                            </Col>
                            <Col span={8}>
                              <Text strong>Has Drift:</Text>
                              <div>
                                <Badge 
                                  status={item.report.drift_analysis.has_drift ? 'error' : 'success'}
                                  text={item.report.drift_analysis.has_drift ? 'Yes' : 'No'}
                                />
                              </div>
                            </Col>
                            <Col span={8}>
                              <Text strong>Severity:</Text>
                              <div>
                                <Tag color={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'blue'}>
                                  {item.priority?.toUpperCase() || 'UNKNOWN'}
                                </Tag>
                              </div>
                            </Col>
                          </Row>
                          
                          {item.report.drift_analysis.details && (
                            <div style={{ marginTop: 12 }}>
                              <Text strong>Details:</Text>
                              <div style={{ 
                                marginTop: 8, 
                                padding: 12, 
                                background: 'white', 
                                borderRadius: 6,
                                border: '1px solid #f0f0f0'
                              }}>
                                <pre style={{ 
                                  margin: 0, 
                                  fontSize: 12, 
                                  whiteSpace: 'pre-wrap',
                                  maxHeight: 200,
                                  overflow: 'auto'
                                }}>
                                  {typeof item.report.drift_analysis.details === 'string' 
                                    ? item.report.drift_analysis.details 
                                    : JSON.stringify(item.report.drift_analysis.details, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    )}

                    {/* Impact Assessment Section */}
                    {item.report.impact_assessment && (
                      <div style={{ marginBottom: 24 }}>
                        <Title level={5} style={{ marginBottom: 12 }}>
                          <WarningOutlined style={{ marginRight: 8, color: '#f5222d' }} />
                          Impact Assessment
                        </Title>
                        <Card size="small" style={{ background: '#fff1f0', border: '1px solid #ffccc7' }}>
                          <Row gutter={[16, 8]}>
                            <Col span={12}>
                              <Text strong>Risk Level:</Text>
                              <div>
                                <Tag color={
                                  item.report.impact_assessment.risk_level === 'high' ? 'red' :
                                  item.report.impact_assessment.risk_level === 'medium' ? 'orange' : 'green'
                                }>
                                  {item.report.impact_assessment.risk_level?.toUpperCase() || 'UNKNOWN'}
                                </Tag>
                              </div>
                            </Col>
                            <Col span={12}>
                              <Text strong>Business Impact:</Text>
                              <div>{item.report.impact_assessment.business_impact || 'Not specified'}</div>
                            </Col>
                          </Row>
                          
                          {item.report.impact_assessment.affected_services && (
                            <div style={{ marginTop: 12 }}>
                              <Text strong>Affected Services:</Text>
                              <div style={{ marginTop: 4 }}>
                                {Array.isArray(item.report.impact_assessment.affected_services) 
                                  ? item.report.impact_assessment.affected_services.map((service: string, idx: number) => (
                                      <Tag key={idx} style={{ marginBottom: 4 }}>{service}</Tag>
                                    ))
                                  : <Text type="secondary">None specified</Text>
                                }
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    )}

                    {/* Remediation Guidance Section */}
                    {item.report.remediation_guidance && (
                      <div style={{ marginBottom: 24 }}>
                        <Title level={5} style={{ marginBottom: 12 }}>
                          <SettingOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          Remediation Guidance
                        </Title>
                        <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                          {item.report.remediation_guidance.recommended_actions && (
                            <div style={{ marginBottom: 12 }}>
                              <Text strong>Recommended Actions:</Text>
                              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                                {Array.isArray(item.report.remediation_guidance.recommended_actions)
                                  ? item.report.remediation_guidance.recommended_actions.map((action: string, idx: number) => (
                                      <li key={idx} style={{ marginBottom: 4 }}>{action}</li>
                                    ))
                                  : <li>{item.report.remediation_guidance.recommended_actions}</li>
                                }
                              </ul>
                            </div>
                          )}
                          
                          {item.report.remediation_guidance.automation_script && (
                            <div>
                              <Text strong>Automation Script:</Text>
                              <div style={{ 
                                marginTop: 8, 
                                padding: 12, 
                                background: '#f0f0f0', 
                                borderRadius: 6,
                                fontFamily: 'monospace',
                                fontSize: 12
                              }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {item.report.remediation_guidance.automation_script}
                                </pre>
                              </div>
                            </div>
                          )}
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {/* Legacy Drift Details */}
                {item.type === 'legacy_drift' && item.drift && (
                  <div>
                    <Title level={5} style={{ marginBottom: 12 }}>
                      <BugOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                      Drift Details
                    </Title>
                    <Card size="small" style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <Text strong>Drift Type:</Text>
                          <div>
                            <Tag color={DRIFT_TYPE_CONFIG[item.driftType as keyof typeof DRIFT_TYPE_CONFIG]?.color}>
                              {item.driftType?.toUpperCase() || 'UNKNOWN'}
                            </Tag>
                          </div>
                        </Col>
                        <Col span={12}>
                          <Text strong>Resource:</Text>
                          <div>{formatResourceName(item.drift.resource)}</div>
                        </Col>
                      </Row>
                      
                      {item.drift.details && (
                        <div style={{ marginTop: 12 }}>
                          <Text strong>Details:</Text>
                          <div style={{ 
                            marginTop: 8, 
                            padding: 12, 
                            background: 'white', 
                            borderRadius: 6,
                            border: '1px solid #f0f0f0'
                          }}>
                            <pre style={{ 
                              margin: 0, 
                              fontSize: 12, 
                              whiteSpace: 'pre-wrap',
                              maxHeight: 200,
                              overflow: 'auto'
                            }}>
                              {typeof item.drift.details === 'string' 
                                ? item.drift.details 
                                : JSON.stringify(item.drift.details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* Resource Group Details */}
                {item.type === 'resource_group' && item.resources && (
                  <div>
                    <Title level={5} style={{ marginBottom: 12 }}>
                      <BarChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      Resource Analysis ({item.resources.length} resources)
                    </Title>
                    
                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                      {item.resources.map((resource: any, idx: number) => (
                        <Card 
                          key={idx} 
                          size="small" 
                          style={{ 
                            marginBottom: 12,
                            border: resource.hasDrift ? '1px solid #ffd591' : '1px solid #f0f0f0',
                            background: resource.hasDrift ? '#fff7e6' : 'white'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text strong>{resource.title}</Text>
                              <div style={{ marginTop: 4 }}>
                                <Badge 
                                  status={resource.hasDrift ? 'warning' : 'success'}
                                  text={resource.status || 'Unknown'}
                                />
                              </div>
                            </div>
                            
                            {resource.hasDrift && resource.driftResult && (
                              <Tag color="orange">
                                {resource.driftResult.drift_count || 1} drift{(resource.driftResult.drift_count || 1) !== 1 ? 's' : ''}
                              </Tag>
                            )}
                          </div>
                          
                          {resource.explanation && (
                            <div style={{ marginTop: 12, padding: 8, background: '#fafafa', borderRadius: 4 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {resource.explanation}
                              </Text>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </Collapse>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button 
            type="default" 
            icon={<ReloadOutlined />}
            onClick={onReset}
          >
            Run New Analysis
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UnifiedResultsDisplay;
