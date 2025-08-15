import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  Button, 
  Alert, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Badge,
  Progress,
  Divider,
  App,
  Tooltip,
  Spin
} from "antd";
import {
  CloudOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  DesktopOutlined,
  FunctionOutlined,
  GlobalOutlined,
  UserOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  WarningOutlined,
  LoadingOutlined,
  ExpandAltOutlined
} from "@ant-design/icons";
import { pdfGeneratorService } from 'services/pdfGenerator.service';

const { Title, Text, Paragraph } = Typography;

// AWS Resource configurations
const AWS_RESOURCE_CONFIG = {
  ec2: {
    name: 'EC2 Instances',
    description: 'Virtual compute instances',
    icon: <DesktopOutlined />,
    color: '#FF9900',
    category: 'Compute'
  },
  s3: {
    name: 'S3 Buckets',
    description: 'Object storage buckets',
    icon: <DatabaseOutlined />,
    color: '#569A31',
    category: 'Storage'
  },
  iam: {
    name: 'IAM Users & Roles',
    description: 'Identity and access management',
    icon: <UserOutlined />,
    color: '#DD344C',
    category: 'Security'
  },
  rds: {
    name: 'RDS Databases',
    description: 'Relational database instances',
    icon: <DatabaseOutlined />,
    color: '#3F48CC',
    category: 'Database'
  },
  lambda: {
    name: 'Lambda Functions',
    description: 'Serverless compute functions',
    icon: <FunctionOutlined />,
    color: '#FF9900',
    category: 'Compute'
  },
  vpc: {
    name: 'VPC Networks',
    description: 'Virtual private cloud networks',
    icon: <GlobalOutlined />,
    color: '#8C4FFF',
    category: 'Networking'
  }
};

interface AnalysisData {
  sessionId: string;
  selectedResources: string[];
  stateData: any;
  fileName: string;
  fileKey: string;
  source: string;
  bucketName: string;
  terraformAnalysis?: any;
  configurationSummary?: any;
}

interface S3StreamingAnalysisProps {
  analysisData: AnalysisData;
  apiBaseUrl: string;
  fileName: string;
}

interface ResourceResult {
  status: string;
  detectionStatus: string;
  reportStatus: string;
  detectionResults?: any;
  reportResults?: any;
}

interface AnalysisState {
  status?: string;
  session_dir?: string;
  resources?: string[];
  [key: string]: any;
}

const S3StreamingAnalysis: React.FC<S3StreamingAnalysisProps> = ({ 
  analysisData, 
  apiBaseUrl, 
  fileName 
}) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisState>({});
  const [resourceResults, setResourceResults] = useState<Record<string, ResourceResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [pdfGenerationState, setPdfGenerationState] = useState<Record<string, any>>({});

  const analysisStartedRef = useRef(false);
  const componentIdRef = useRef(Math.random().toString(36).substr(2, 9));

  // Create a simple notification function
  const showMessage = useCallback((type: 'success' | 'error', content: string) => {
    // For now, we'll use console.log and could be replaced with a proper notification system
    console.log(`${type.toUpperCase()}: ${content}`);
    
    // You could also create a simple toast notification here
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#52c41a' : '#ff4d4f'};
      color: white;
      border-radius: 6px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = content;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }, []);

  /**
   * Start the streaming analysis for S3 state file
   */
  const startAnalysis = useCallback(async () => {
    if (!analysisData || isAnalyzing || hasStarted || analysisStartedRef.current) {
      return;
    }

    analysisStartedRef.current = true;
    
    setHasStarted(true);
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults({});
    setResourceResults({});
    setAnalysisComplete(false);

    try {
      const response = await fetch(`${apiBaseUrl}/api/s3/analyze-state-file-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: analysisData.sessionId,
          selected_resources: analysisData.selectedResources,
          state_data: analysisData.stateData,
          file_name: analysisData.fileName,
          file_key: analysisData.fileKey,
          source: analysisData.source,
          bucket_name: analysisData.bucketName,
          terraformAnalysis: analysisData.terraformAnalysis,
          configurationSummary: analysisData.configurationSummary
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        if (response.status === 423) {
          setError('Analysis already in progress for this file. Please wait for it to complete.');
          return;
        } else if (response.status === 401) {
          setError('Authentication failed. Your session may have expired. Please reconnect to your cloud environment.');
          return;
        } else if (response.status === 403) {
          setError('Access forbidden. Please check your permissions and try again.');
          return;
        }
        
        const errorMessage = errorData.details || errorData.error || `Analysis failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }
      
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamingUpdate(data);
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }

      setAnalysisComplete(true);

    } catch (error) {
      console.error('S3 streaming analysis error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setHasStarted(false);
      analysisStartedRef.current = false;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisData, apiBaseUrl, fileName, isAnalyzing, hasStarted]);

  /**
   * Handle streaming updates from the analysis
   */
  const handleStreamingUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'session_initialized':
        setAnalysisResults(prev => ({
          ...prev,
          status: 'session_initialized',
          session_dir: data.session_dir
        }));
        break;

      case 'analysis_started':
        setAnalysisResults(prev => ({
          ...prev,
          status: 'started',
          resources: data.resources
        }));
        break;

      case 'resource_initialized':
        setResourceResults(prev => ({
          ...prev,
          [data.resource]: {
            status: 'initialized',
            detectionStatus: data.detectionStatus || 'pending',
            reportStatus: data.reportStatus || 'pending'
          }
        }));
        break;

      case 'resource_group_update':
        if (data.data && data.data.resources) {
          setAnalysisResults(prev => ({
            ...prev,
            resources: prev.resources || Object.keys(data.data.resources)
          }));
          
          setResourceResults(prev => {
            const updated = { ...prev };
            
            Object.entries(data.data.resources).forEach(([resourceType, resourceData]: [string, any]) => {
              const hasDetectionResults = resourceData.drift_result && 
                                        (resourceData.drift_result.drifts || resourceData.drift_result.has_drift !== undefined);
              const hasReport = resourceData.report && resourceData.report !== null;
              const isCompleted = resourceData.status === 'completed';
              
              const detectionStatus = isCompleted || hasDetectionResults ? 'complete' : 'pending';
              const reportStatus = isCompleted || hasReport ? 'complete' : 'pending';
              
              updated[resourceType] = {
                status: resourceData.status || 'processing',
                detectionStatus: detectionStatus,
                reportStatus: reportStatus,
                detectionResults: resourceData.drift_result,
                reportResults: resourceData.report
              };
            });
            
            return updated;
          });
        }
        break;

      case 'detection_complete':
        setResourceResults(prev => ({
          ...prev,
          [data.resource]: {
            ...prev[data.resource],
            detectionStatus: 'complete',
            detectionResults: data.results
          }
        }));
        break;

      case 'report_complete':
        setResourceResults(prev => ({
          ...prev,
          [data.resource]: {
            ...prev[data.resource],
            reportStatus: 'complete',
            reportResults: data.results
          }
        }));
        break;

      case 'analysis_complete':
        setAnalysisComplete(true);
        break;

      case 'error':
        setError(data.error);
        break;

      default:
        // Unknown streaming update type
    }
  }, []);

  /**
   * Start analysis when component mounts
   */
  useEffect(() => {
    if (analysisData && !hasStarted && !isAnalyzing) {
      startAnalysis();
    }
  }, [analysisData, hasStarted, isAnalyzing, fileName, startAnalysis]);

  /**
   * Handle resource expansion toggle
   */
  const handleResourceToggle = useCallback((resourceId: string) => {
    setExpandedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  }, []);

  /**
   * Get drift count for a resource
   */
  const getDriftCount = useCallback((results?: ResourceResult) => {
    if (!results?.detectionResults) return 0;
    
    const detectionData = results.detectionResults;
    if (detectionData.drift_count !== undefined) {
      return detectionData.drift_count;
    }
    
    if (detectionData.drifts && Array.isArray(detectionData.drifts)) {
      return detectionData.drifts.length;
    }
    
    return 0;
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
   * Download data as PDF report with enhanced UX using local PDF generation
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

      // Transform data to match the expected format for PDF generation
      const analysisResults = {
        drifts: Array.isArray(data.drifts) ? data.drifts : 
                Array.isArray(data) ? data : 
                data.differences ? data.differences : [],
        summary: {
          total_drifts: data.drift_count || (Array.isArray(data.drifts) ? data.drifts.length : 0),
          drift_types: {},
          severity_distribution: {}
        },
        metadata: {
          resource_type: resourceType,
          file_name: filename,
          analysis_timestamp: new Date().toISOString()
        }
      };

      updateProgress('processing', 75, '⚙️ Processing report data...');

      // Use local PDF generation service
      const pdfBytes = pdfGeneratorService.generateDriftAnalysisReport(
        analysisResults,
        resourceType,
        filename
      );

      updateProgress('downloading', 100, '🎉 Report ready! Starting download...');

      // Create blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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

      showMessage('success', 'PDF report downloaded successfully!');

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

      showMessage('error', 'Failed to generate PDF report. Please try again.');
    }
  }, [showMessage]);

  /**
   * Render comprehensive AI-generated report
   */
  const renderComprehensiveReport = useCallback((detectionData: any, resourceType: string) => {
    if (!detectionData) return null;

    // Extract drift data
    let drifts: any[] = [];
    if (detectionData.drifts && Array.isArray(detectionData.drifts)) {
      drifts = detectionData.drifts;
    } else if (Array.isArray(detectionData)) {
      drifts = detectionData;
    } else if (detectionData.differences && Array.isArray(detectionData.differences)) {
      drifts = detectionData.differences;
    }

    const driftCount = drifts.length;
    const resource = AWS_RESOURCE_CONFIG[resourceType.toLowerCase() as keyof typeof AWS_RESOURCE_CONFIG] || {
      name: resourceType.toUpperCase(),
      description: 'AWS Resource',
      icon: <DesktopOutlined />,
      color: '#6c757d',
      category: 'Other'
    };

    return (
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* Executive Summary */}
        <div style={{ 
          background: driftCount === 0 ? 'linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)' : 'linear-gradient(135deg, #fff2e8 0%, #ffebe6 100%)',
          border: driftCount === 0 ? '1px solid #b7eb8f' : '1px solid #ffbb96',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              background: resource.color,
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {resource.icon}
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#262626' }}>
                {resource.name} Analysis Report
              </Title>
              <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                {resource.category} • Infrastructure Drift Analysis
              </Text>
            </div>
          </div>

          {driftCount === 0 ? (
            <Alert 
              message="✅ No Infrastructure Drift Detected"
              description="Excellent! Your resources match the expected configuration perfectly. Infrastructure is compliant with IaC definitions."
              type="success" 
              showIcon={false}
              style={{ 
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
            />
          ) : (
            <Alert 
              message={`⚠️ ${driftCount} Configuration Issue${driftCount !== 1 ? 's' : ''} Detected`}
              description="Infrastructure configuration differs from expected state. Review the detailed analysis below for remediation guidance."
              type="warning" 
              showIcon={false}
              style={{ 
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
            />
          )}
        </div>

        {/* Detailed Analysis */}
        {driftCount > 0 && (
          <>
            <Title level={4} style={{ color: '#262626', marginBottom: 16 }}>
              📊 Detailed Drift Analysis
            </Title>
            
            <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
              {drifts.map((drift: any, index: number) => (
                <Card 
                  key={index} 
                  size="small" 
                  style={{ 
                    borderLeft: '4px solid #ff9800',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#262626' }}>
                      {getDriftTypeIcon(drift.type)} {formatDriftType(drift.type)}
                    </Title>
                    {drift.details && (
                      <Paragraph style={{ margin: 0, marginBottom: 8, color: '#595959', lineHeight: 1.6 }}>
                        {drift.details}
                      </Paragraph>
                    )}
                    {drift.resource && (
                      <div style={{ marginTop: 8 }}>
                        <Badge 
                          text={`Resource: ${Array.isArray(drift.resource) ? drift.resource.join(' / ') : drift.resource}`}
                          color="blue"
                          style={{ fontSize: '12px' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Remediation Guidance */}
                  <div style={{ 
                    background: '#fafafa',
                    borderRadius: '6px',
                    padding: '12px',
                    marginTop: 12
                  }}>
                    <Text strong style={{ color: '#262626', fontSize: '13px' }}>
                      🔧 Recommended Action:
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: '#595959', fontSize: '12px', lineHeight: 1.5 }}>
                        {getRemediationGuidance(drift.type)}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </Space>

            {/* Impact Assessment */}
            <Title level={4} style={{ color: '#262626', marginBottom: 16 }}>
              🎯 Impact Assessment
            </Title>
            
            <div style={{ 
              background: '#f0f8ff',
              border: '1px solid #d6f7ff',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: 24
            }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text strong style={{ color: '#262626', fontSize: '14px' }}>
                      🏢 Business Impact:
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: '#595959', fontSize: '13px', lineHeight: 1.5 }}>
                        {getBusinessImpact(drifts, resourceType)}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong style={{ color: '#262626', fontSize: '14px' }}>
                      ⚙️ Technical Impact:
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: '#595959', fontSize: '13px', lineHeight: 1.5 }}>
                        {getTechnicalImpact(drifts, resourceType)}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Best Practices */}
            <Title level={4} style={{ color: '#262626', marginBottom: 16 }}>
              💡 Prevention Best Practices
            </Title>
            
            <div style={{ 
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#595959', fontSize: '13px' }}>
                    <strong>Regular Monitoring:</strong> Schedule weekly drift detection scans for {resource.name.toLowerCase()}
                  </Text>
                </li>
                <li style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#595959', fontSize: '13px' }}>
                    <strong>Change Management:</strong> Require all infrastructure changes to go through Terraform
                  </Text>
                </li>
                <li style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#595959', fontSize: '13px' }}>
                    <strong>Access Control:</strong> Limit direct cloud console access to emergency situations only
                  </Text>
                </li>
                <li style={{ marginBottom: 0 }}>
                  <Text style={{ color: '#595959', fontSize: '13px' }}>
                    <strong>Automation:</strong> Implement CI/CD pipelines for infrastructure deployments
                  </Text>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* No Drift - Best Practices */}
        {driftCount === 0 && (
          <>
            <Title level={4} style={{ color: '#262626', marginBottom: 16 }}>
              🎉 Excellent Infrastructure Management
            </Title>
            
            <div style={{ 
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <Text style={{ color: '#595959', fontSize: '14px', lineHeight: 1.6 }}>
                Your {resource.name.toLowerCase()} infrastructure is perfectly aligned with your IaC configuration. 
                This indicates excellent infrastructure governance and change management practices. 
                Continue monitoring regularly to maintain this high standard.
              </Text>
            </div>
          </>
        )}
      </div>
    );
  }, []);

  // Helper functions for the comprehensive report
  const getDriftTypeIcon = (type: string) => {
    switch (type) {
      case 'missing': return '❌';
      case 'orphaned': return '🔗';
      case 'configuration_drift': return '⚙️';
      case 'error': return '⚠️';
      default: return '📋';
    }
  };

  const formatDriftType = (type: string) => {
    switch (type) {
      case 'missing': return 'Missing Resources';
      case 'orphaned': return 'Orphaned Resources';
      case 'configuration_drift': return 'Configuration Drift';
      case 'error': return 'Analysis Error';
      default: return 'Configuration Issue';
    }
  };

  const getRemediationGuidance = (type: string) => {
    switch (type) {
      case 'missing':
        return 'Run "terraform plan" to review changes, then "terraform apply" to create the missing resource.';
      case 'orphaned':
        return 'Import the resource into Terraform state using "terraform import" or remove it if no longer needed.';
      case 'configuration_drift':
        return 'Update your Terraform configuration to match the current state or revert cloud changes.';
      case 'error':
        return 'Check your AWS credentials and permissions, then retry the analysis.';
      default:
        return 'Review the configuration and align with your infrastructure as code standards.';
    }
  };

  const getBusinessImpact = (drifts: any[], resourceType: string) => {
    const highPriorityTypes = ['missing', 'error'];
    const hasHighPriority = drifts.some(d => highPriorityTypes.includes(d.type));
    
    if (hasHighPriority) {
      return `High impact: Missing or error conditions may cause service disruptions for ${resourceType} resources.`;
    } else {
      return `Medium impact: Configuration drift may lead to compliance issues and unexpected behavior.`;
    }
  };

  const getTechnicalImpact = (drifts: any[], resourceType: string) => {
    const driftCount = drifts.length;
    
    if (driftCount > 3) {
      return `Significant technical debt: ${driftCount} issues indicate systematic infrastructure management problems.`;
    } else if (driftCount > 1) {
      return `Moderate complexity: Multiple configuration differences require coordinated remediation.`;
    } else {
      return `Low complexity: Single issue can be resolved quickly with minimal risk.`;
    }
  };

  /**
   * Render drift detection results (legacy function for backward compatibility)
   */
  const renderDetectionResults = useCallback((detectionData: any) => {
    if (!detectionData) return null;

    let drifts: any[] = [];
    if (detectionData.drifts && Array.isArray(detectionData.drifts)) {
      drifts = detectionData.drifts;
    } else if (Array.isArray(detectionData)) {
      drifts = detectionData;
    } else if (detectionData.differences && Array.isArray(detectionData.differences)) {
      drifts = detectionData.differences;
    }

    if (!drifts || drifts.length === 0) {
      return (
        <Alert 
          message="No Infrastructure Drift Detected"
          description="Your resources match the expected configuration. Infrastructure is compliant with IaC definitions."
          type="success" 
          showIcon 
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      );
    }

    return (
      <div>
        <Alert 
          message={`${drifts.length} Drift${drifts.length !== 1 ? 's' : ''} Detected`}
          description="Infrastructure configuration differs from expected state."
          type="warning" 
          showIcon 
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />

        <Space direction="vertical" style={{ width: '100%' }}>
          {drifts.map((drift: any, index: number) => (
            <Card key={index} size="small" style={{ borderLeft: '4px solid #ff9800' }}>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                {drift.type || 'Configuration Drift'}
              </Title>
              {drift.details && (
                <Paragraph style={{ margin: 0, marginBottom: 8, color: '#666' }}>
                  {drift.details}
                </Paragraph>
              )}
              {drift.resource && (
                <Badge 
                  text={`Resource: ${drift.resource}`}
                  color="blue"
                />
              )}
            </Card>
          ))}
        </Space>
      </div>
    );
  }, []);

  /**
   * Render beautiful resource card
   */
  const renderResourceCard = (resourceId: string, results?: ResourceResult) => {
    const resource = AWS_RESOURCE_CONFIG[resourceId.toLowerCase() as keyof typeof AWS_RESOURCE_CONFIG] || {
      name: resourceId.toUpperCase(),
      description: 'AWS Resource',
      icon: <DesktopOutlined />,
      color: '#6c757d',
      category: 'Other'
    };

    const detectionStatus = results?.detectionStatus || 'pending';
    const reportStatus = results?.reportStatus || 'pending';
    const isExpanded = expandedResources.has(resourceId);
    const driftCount = getDriftCount(results);

    return (
      <Col xs={24} sm={12} lg={8} key={resourceId}>
        <Card
          style={{ 
            borderColor: isExpanded ? resource.color : undefined,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => handleResourceToggle(resourceId)}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div 
              style={{ 
                backgroundColor: resource.color,
                color: 'white',
                padding: '8px',
                borderRadius: '4px',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {resource.icon}
            </div>
            <div>
              <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                {resource.name}
              </Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {resource.category}
              </Text>
            </div>
          </div>

          {/* Status Badges */}
          <div style={{ width: '100%', marginBottom: 16 }}>
            {driftCount > 0 && (
              <div style={{ marginBottom: 12 }}>
                <Badge 
                  count={`${driftCount} issue${driftCount !== 1 ? 's' : ''}`}
                  style={{ backgroundColor: '#f5222d' }}
                />
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: 8, 
              flexWrap: 'wrap',
              alignItems: 'center',
              minHeight: '24px'
            }}>
              <Badge 
                status={detectionStatus === 'complete' ? 'success' : 'processing'}
                text={
                  <span style={{ 
                    fontSize: '12px', 
                    lineHeight: '1.4',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }}>
                    Detection: {detectionStatus}
                  </span>
                }
              />
              <Badge 
                status={reportStatus === 'complete' ? 'success' : 'processing'}
                text={
                  <span style={{ 
                    fontSize: '12px', 
                    lineHeight: '1.4',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }}>
                    Report: {reportStatus}
                  </span>
                }
              />
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (results?.detectionResults || results?.reportResults) && (
            <div>
              <Divider />
              
              {/* AI-Generated Report Display */}
              {results?.detectionResults && (
                <div style={{ 
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #f0f0f0'
                }}>
                  {renderComprehensiveReport(results.detectionResults, resourceId)}
                </div>
              )}

              {/* Download Options (Minimized) */}
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <Space size="small">
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadAsJson(results.detectionResults, `${fileName}_${resourceId}_detection.json`);
                    }}
                    style={{ fontSize: '11px' }}
                  >
                    Export JSON
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Card>
      </Col>
    );
  };

  /**
   * Handle retry button click
   */
  const handleRetry = useCallback(() => {
    analysisStartedRef.current = false;
    setHasStarted(false);
    setError(null);
    setAnalysisResults({});
    setResourceResults({});
    setAnalysisComplete(false);
    
    startAnalysis();
  }, [fileName, startAnalysis]);

  // Render error state
  if (error) {
    return (
      <Card style={{ marginTop: 24 }}>
        <Alert
          message="Analysis Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              onClick={handleRetry}
            >
              Retry Analysis
            </Button>
          }
        />
      </Card>
    );
  }

  // Render loading state
  if (isAnalyzing && Object.keys(resourceResults).length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Animated background elements */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            animation: 'float 20s infinite linear',
            pointerEvents: 'none'
          }} />
          
          <div style={{ 
            position: 'relative',
            zIndex: 1,
            padding: '32px'
          }}>
            {/* Header Section */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 32,
              color: 'white'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '16px',
                padding: '16px',
                marginRight: '20px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <CloudOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '24px' }}>
                  🚀 Live Infrastructure Analysis
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 500 }}>
                  {fileName}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    Real-time drift detection • AI-powered analysis • Cloud-native scanning
                  </Text>
                </div>
              </div>
            </div>
            
            {/* Main Analysis Card */}
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  padding: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Spin 
                    indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />} 
                  />
                </div>
                <div>
                  <Text style={{ color: 'white', fontWeight: 600, fontSize: '18px', display: 'block' }}>
                    Initializing Analysis Engine
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                    Connecting to AWS infrastructure • Parsing Terraform state • Setting up drift detection
                  </Text>
                </div>
              </div>
              
              <Progress 
                percent={25}
                strokeColor={{
                  '0%': '#52c41a',
                  '50%': '#1890ff',
                  '100%': '#722ed1',
                }}
                trailColor="rgba(255,255,255,0.2)"
                showInfo={true}
                strokeWidth={12}
                style={{ marginBottom: 16 }}
                format={(percent) => (
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>
                    {percent}%
                  </span>
                )}
              />
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 16,
                marginTop: 20
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <SecurityScanOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                    <Text style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>
                      SECURITY SCAN
                    </Text>
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                    Analyzing IAM policies and security groups
                  </Text>
                </div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <DatabaseOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                    <Text style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>
                      RESOURCE MAPPING
                    </Text>
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                    Discovering and cataloging resources
                  </Text>
                </div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />
                    <Text style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>
                      DRIFT DETECTION
                    </Text>
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                    Comparing actual vs expected state
                  </Text>
                </div>
              </div>
            </div>
            
            {/* Status Footer */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Badge 
                  status="processing" 
                  text={<span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>Live Analysis Active</span>}
                />
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.3)' }} />
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  ⚡ Real-time streaming • 🔒 Secure connection • 🌐 Multi-region support
                </Text>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '6px 12px',
                backdropFilter: 'blur(10px)'
              }}>
                <Text style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>
                  INITIALIZING...
                </Text>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Add CSS animation using a style element */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0% { transform: translateX(-100px) translateY(-100px); }
              100% { transform: translateX(100px) translateY(100px); }
            }
          `
        }} />
      </div>
    );
  }

  const resources = analysisResults.resources || [];

  return (
    <div style={{ 
      background: 'white', 
      minHeight: 'calc(100vh - 64px)', 
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <Card 
          style={{ 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
            background: 'white'
          }}
        >
          <div style={{ 
            padding: '24px 32px',
            borderBottom: '1px solid #f0f0f0',
            background: 'white',
            color: '#262626',
            marginBottom: 24,
            position: 'relative'
          }}>
            {/* Animated background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{ 
              position: 'relative',
              zIndex: 1,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  background: '#1890ff',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #1890ff'
                }}>
                  <CloudOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
                <div>
                  <Title level={3} style={{ margin: 0, color: '#262626', fontWeight: 600, fontSize: '20px' }}>
                    Live Analysis Results
                  </Title>
                  <Text style={{ color: '#595959', fontSize: '14px', fontWeight: 400 }}>
                    {fileName}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                      Real-time drift analysis • S3 state file processing
                    </Text>
                  </div>
                </div>
              </div>
              
              {analysisComplete && (
                <div style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  border: '1px solid rgba(24, 144, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.2)'
                }}>
                  <Badge 
                    status="success" 
                    text={<span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>✅ Analysis Complete</span>}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '0 32px 32px 32px' }}>
            {/* Progress indicator */}
          {isAnalyzing && resources.length > 0 && (
            <div style={{ 
              marginBottom: 24,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              padding: '20px',
              border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  padding: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Spin 
                    indicator={<LoadingOutlined style={{ fontSize: 16, color: 'white' }} spin />} 
                  />
                </div>
                <div>
                  <Text style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
                    🔍 Live Resource Analysis in Progress
                  </Text>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '4px' }}>
                    Processing {resources.length} AWS resource type{resources.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
                    Analysis Progress
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    {Object.keys(resourceResults).length} / {resources.length} resources
                  </Text>
                </div>
                
                <Progress 
                  percent={Math.round((Object.keys(resourceResults).length / resources.length) * 100)}
                  strokeColor={{
                    '0%': '#52c41a',
                    '100%': '#1890ff',
                  }}
                  trailColor="rgba(255,255,255,0.2)"
                  showInfo={true}
                  strokeWidth={10}
                  format={(percent) => (
                    <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>
                      {percent}%
                    </span>
                  )}
                />
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: 12
                }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Badge 
                      status="processing" 
                      text={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Detecting drifts</span>}
                    />
                    <Badge 
                      status="processing" 
                      text={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Generating reports</span>}
                    />
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                    ⚡ Real-time streaming
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Resource Grid */}
          {resources.length > 0 && (
            <Row gutter={[24, 24]}>
              {resources.map(resourceId => 
                renderResourceCard(resourceId, resourceResults[resourceId])
              )}
            </Row>
          )}

          {/* No Resources Message */}
          {!isAnalyzing && resources.length === 0 && (
            <Alert
              message="No Resources Found"
              description="No AWS resources were detected in this state file for analysis."
              type="info"
              showIcon
            />
          )}

          {/* Completion Message */}
          {analysisComplete && (
            <Alert
              message="Analysis Complete"
              description={`Infrastructure drift analysis completed for ${fileName}`}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default S3StreamingAnalysis;
