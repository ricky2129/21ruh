import React, { useState, useEffect } from "react";
import { 
  Card, 
  Button, 
  Select, 
  Alert, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Badge,
  Switch,
  message,
  Form,
  Input as AntInput,
  Steps
} from "antd"
import {
  CloudOutlined,
  DisconnectOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  DesktopOutlined,
  FunctionOutlined,
  GlobalOutlined,
  UserOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  ReloadOutlined,
  EyeInvisibleOutlined, 
  EyeTwoTone,
  RightOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  useGetS3Buckets, 
  useGetStateFiles, 
  useAnalyzeBucket,
  useConnectToAWS,
  type S3Bucket,
  type StateFile,
  type ConnectAWSRequest
} from "react-query/driftAssistQueries";
import { S3StreamingAnalysis, UnifiedResultsDisplay } from "components/DriftAssist";
import "./DriftAssist.styles.scss";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface DriftAssistProps {
  onClose?: () => void;
  onNavigateToWorkflow?: () => void;
  initialSessionId?: string;
  initialAwsCredentials?: any;
}

const DriftAssist: React.FC<DriftAssistProps> = ({ 
  onClose, 
  onNavigateToWorkflow, 
  initialSessionId, 
  initialAwsCredentials 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get sessionId from navigation state or props (for workflow integration)
  const sessionId = initialSessionId || location.state?.sessionId;
  const awsCredentials = initialAwsCredentials || location.state?.awsCredentials;

  const [selectedBucket, setSelectedBucket] = useState<string | undefined>();
  const [stateFiles, setStateFiles] = useState<StateFile[]>([]);
  const [activePreset, setActivePreset] = useState("common");
  const [showDetails, setShowDetails] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [currentAnalysisData, setCurrentAnalysisData] = useState<any>(null);
  
  // Initialize step - always start at S3 bucket selection since credentials come from ConfigureDriftAssist
  const [currentStep, setCurrentStep] = useState(0);
  
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
    sessionId || initialSessionId
  );
  const [currentAwsCredentials, setCurrentAwsCredentials] = useState<any>(
    awsCredentials || initialAwsCredentials
  );

  // Handle sessionId and credentials from navigation state or props
  useEffect(() => {
    const finalSessionId = sessionId || initialSessionId;
    const finalCredentials = awsCredentials || initialAwsCredentials;
    
    console.log('DriftAssist: useEffect triggered', { 
      finalSessionId, 
      finalCredentials, 
      currentStep,
      sessionIdFromProps: sessionId,
      initialSessionIdFromProps: initialSessionId,
      awsCredentialsFromProps: awsCredentials,
      initialAwsCredentialsFromProps: initialAwsCredentials
    });
    
    if (finalSessionId && finalCredentials) {
      console.log('DriftAssist: Setting up with existing credentials');
      setCurrentSessionId(finalSessionId);
      setCurrentAwsCredentials(finalCredentials);
    } else if (finalSessionId) {
      // If we have sessionId but no credentials, still set the sessionId
      console.log('DriftAssist: Setting up with sessionId only');
      setCurrentSessionId(finalSessionId);
    } else {
      console.warn('DriftAssist: No sessionId or credentials found', {
        sessionId,
        initialSessionId,
        awsCredentials,
        initialAwsCredentials
      });
    }
  }, [sessionId, awsCredentials, initialSessionId, initialAwsCredentials]);

  // API hooks
  const { data: s3BucketsData, isLoading: isLoadingBuckets, error: bucketsError } = useGetS3Buckets(currentSessionId, !!currentSessionId);
  const { data: stateFilesData, isLoading: isLoadingStateFiles } = useGetStateFiles(currentSessionId, selectedBucket || "", !!currentSessionId && !!selectedBucket);
  const analyzeBucketMutation = useAnalyzeBucket();

  // Update state files when data changes
  useEffect(() => {
    if (stateFilesData?.state_files) {
      setStateFiles(stateFilesData.state_files);
    } else if (selectedBucket && stateFilesData && !stateFilesData.state_files) {
      setStateFiles([]);
    }
  }, [stateFilesData, selectedBucket]);

  const [resourceTypes, setResourceTypes] = useState([
    {
      id: "ec2",
      name: "EC2 Instances",
      description: "Virtual compute instances",
      category: "Compute",
      priority: "Medium",
      color: "#ff9500",
      icon: <DesktopOutlined />,
      selected: true
    },
    {
      id: "s3",
      name: "S3 Buckets", 
      description: "Object storage buckets",
      category: "Storage",
      priority: "Low",
      color: "#52c41a",
      icon: <DatabaseOutlined />,
      selected: true
    },
    {
      id: "iam",
      name: "IAM Users & Roles",
      description: "Identity and access management",
      category: "Security",
      priority: "High",
      color: "#f5222d",
      icon: <UserOutlined />,
      selected: true
    },
    {
      id: "rds",
      name: "RDS Databases",
      description: "Relational database instances",
      category: "Database",
      priority: "Medium",
      color: "#1890ff",
      icon: <DatabaseOutlined />,
      selected: false
    },
    {
      id: "lambda",
      name: "Lambda Functions",
      description: "Serverless compute functions",
      category: "Compute",
      priority: "Low",
      color: "#faad14",
      icon: <FunctionOutlined />,
      selected: false
    },
    {
      id: "vpc",
      name: "VPC Networks",
      description: "Virtual private cloud networks",
      category: "Networking",
      priority: "High",
      color: "#722ed1",
      icon: <GlobalOutlined />,
      selected: false
    }
  ]);

  const presets = [
    { id: "common", name: "Common Resources" },
    { id: "compute", name: "Compute Focus" },
    { id: "security", name: "Security Audit" },
    { id: "storage", name: "Storage & Data" }
  ];

  const selectedCount = resourceTypes.filter(r => r.selected).length;
  const totalCount = resourceTypes.length;
  const estimatedTime = selectedCount * 2; // 2 minutes per resource

  const handleResourceToggle = (resourceId: string) => {
    setResourceTypes(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, selected: !resource.selected }
          : resource
      )
    );
  };

  const handlePresetSelect = (presetId: string) => {
    setActivePreset(presetId);
    
    // Apply preset logic
    setResourceTypes(prev => prev.map(resource => {
      switch (presetId) {
        case "common":
          return { ...resource, selected: ["ec2", "s3", "iam"].includes(resource.id) };
        case "compute":
          return { ...resource, selected: ["ec2", "lambda"].includes(resource.id) };
        case "security":
          return { ...resource, selected: ["iam", "vpc"].includes(resource.id) };
        case "storage":
          return { ...resource, selected: ["s3", "rds"].includes(resource.id) };
        default:
          return resource;
      }
    }));
  };

  const handleSelectAll = () => {
    setResourceTypes(prev => prev.map(resource => ({ ...resource, selected: true })));
  };

  const handleClearAll = () => {
    setResourceTypes(prev => prev.map(resource => ({ ...resource, selected: false })));
  };

  const handleBucketSelect = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setStateFiles([]); // Clear previous state files
  };

  const handleAnalyze = async () => {
    if (!currentSessionId || !selectedBucket || selectedCount === 0) {
      message.error('Please select a bucket and at least one resource type');
      return;
    }

    if (stateFiles.length === 0) {
      message.error(`Selected bucket '${selectedBucket}' has no state files.`);
      return;
    }

    try {
      setIsAnalyzing(true);
      setCurrentStep(3); // Move to analysis step
      
      const selectedResources = resourceTypes
        .filter(resource => resource.selected)
        .map(resource => resource.id);

      // Show immediate feedback
      message.loading('Initializing drift analysis...', 2);

      // First, call the bucket analysis API to prepare all state files
      const bucketAnalysisResult = await analyzeBucketMutation.mutateAsync({
        session_id: currentSessionId,
        bucket_name: selectedBucket,
        selected_resources: selectedResources
      });

      console.log('Bucket analysis result:', bucketAnalysisResult);

      // Set the analysis results for the results tab
      setAnalysisResults(bucketAnalysisResult);

      // Find the first ready state file for streaming analysis
      const readyFile = bucketAnalysisResult.analysis_results?.find(
        (file: any) => file.status === 'ready_for_analysis'
      );

      if (readyFile && readyFile.analysis_data) {
        setCurrentAnalysisData(readyFile.analysis_data);
        
        // Navigate to workflow tab if callback is provided
        if (onNavigateToWorkflow) {
          setTimeout(() => {
            onNavigateToWorkflow();
            message.success('Analysis started! Monitoring live progress...');
          }, 1000);
        } else {
          message.success('Starting drift analysis...');
        }
      } else {
        setCurrentStep(4); // Move to results step
        message.warning('No state files ready for analysis. Check results for details.');
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Enhanced error handling with specific error messages
      let errorMessage = 'Failed to start analysis';
      
      if (error instanceof Error) {
        // Extract specific error messages based on known error patterns
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('access denied') || errorText.includes('not authorized')) {
          errorMessage = 'AWS access denied. Please check your credentials and permissions.';
        } else if (errorText.includes('timeout') || errorText.includes('timed out')) {
          errorMessage = 'Analysis timed out. The operation took too long to complete.';
        } else if (errorText.includes('bucket') && errorText.includes('not found')) {
          errorMessage = `Bucket '${selectedBucket}' not found or inaccessible.`;
        } else if (errorText.includes('rate limit') || errorText.includes('throttling')) {
          errorMessage = 'AWS API rate limit exceeded. Please try again in a few minutes.';
        } else if (errorText.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          // Use the actual error message if available
          errorMessage = `Analysis error: ${error.message}`;
        }
      }
      
      // Show error message with more details
      message.error({
        content: errorMessage,
        duration: 8, // Show for longer time
        style: { 
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12)'
        }
      });
      
      // Return to resource selection step instead of showing empty results
      setCurrentStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAnalysis = () => {
    setAnalysisResults(null);
    setCurrentAnalysisData(null);
    setCurrentStep(1);
    setIsAnalyzing(false);
  };
  
  // Handle disconnect with confirmation
  const handleDisconnect = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to disconnect? This will reset your current session and any unsaved analysis progress will be lost.')) {
      setCurrentSessionId(undefined);
      setCurrentAwsCredentials(undefined);
      setCurrentStep(0);
      setAnalysisResults(null);
      setCurrentAnalysisData(null);
      setSelectedBucket(undefined);
      setStateFiles([]);
      message.info('Disconnected from AWS');
    }
  };

  const connectToAWSMutation = useConnectToAWS();

  const handleAwsConnected = (sessionId: string, credentials: any) => {
    setCurrentSessionId(sessionId);
    setCurrentAwsCredentials(credentials);
    setCurrentStep(1);
    message.success('Successfully connected to AWS!');
    
    // Navigate to workflow tab if callback is provided
    if (onNavigateToWorkflow) {
      setTimeout(() => {
        onNavigateToWorkflow();
        message.success('Connected to AWS! Continue setup in Workflows tab.');
      }, 1000);
    }
  };

  const handleConnectToAWS = async (values: any) => {
    try {
      const connectRequest: ConnectAWSRequest = {
        provider: values.provider,
        credentials: {
          access_key: values.access_key,
          secret_key: values.secret_key,
        },
        region: values.region,
      };

      const response = await connectToAWSMutation.mutateAsync(connectRequest);
      
      handleAwsConnected(response.session_id, {
        region: values.region,
        provider: values.provider
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to connect to AWS');
    }
  };

  const AWS_REGIONS = [
    { label: "US East (N. Virginia) - us-east-1", value: "us-east-1" },
    { label: "US East (Ohio) - us-east-2", value: "us-east-2" },
    { label: "US West (N. California) - us-west-1", value: "us-west-1" },
    { label: "US West (Oregon) - us-west-2", value: "us-west-2" },
    { label: "Europe (Ireland) - eu-west-1", value: "eu-west-1" },
    { label: "Europe (London) - eu-west-2", value: "eu-west-2" },
    { label: "Europe (Frankfurt) - eu-central-1", value: "eu-central-1" },
    { label: "Asia Pacific (Singapore) - ap-southeast-1", value: "ap-southeast-1" },
    { label: "Asia Pacific (Sydney) - ap-southeast-2", value: "ap-southeast-2" },
    { label: "Asia Pacific (Tokyo) - ap-northeast-1", value: "ap-northeast-1" },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const steps = [
    {
      title: 'S3 Bucket',
      description: 'Select bucket',
      icon: <DatabaseOutlined />
    },
    {
      title: 'Scan Files',
      description: 'Find state files',
      icon: <SecurityScanOutlined />
    },
    {
      title: 'Resources',
      description: 'Choose resources',
      icon: <SettingOutlined />
    },
    {
      title: 'Analysis',
      description: 'Drift detection',
      icon: <BarChartOutlined />
    },
    {
      title: 'Report',
      description: 'Export results',
      icon: <CheckCircleOutlined />
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
            <Card 
              style={{ 
                borderRadius: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e8e8e8',
                marginBottom: 32
              }}
            >
              <div style={{ 
                padding: '24px 32px',
                borderBottom: '1px solid #f0f0f0',
                background: '#fafafa',
                borderRadius: '16px 16px 0 0',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <DatabaseOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#262626' }}>
                      Select S3 Bucket
                    </Title>
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Choose an S3 bucket to scan for Terraform state files
                    </Text>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 32px 32px 32px' }}>
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ fontSize: 16, color: '#262626', display: 'block', marginBottom: 12 }}>
                    Available S3 Buckets
                  </Text>
                  <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                    Select a bucket that contains your Terraform state files for analysis.
                  </Text>

                  <Select
                    size="large"
                    placeholder={isLoadingBuckets ? "Loading buckets..." : "Select a bucket"}
                    style={{ width: '100%', marginBottom: 16 }}
                    value={selectedBucket}
                    onChange={handleBucketSelect}
                    loading={isLoadingBuckets}
                    status={bucketsError ? 'error' : undefined}
                  >
                    {s3BucketsData?.buckets?.map((bucket: S3Bucket) => (
                      <Option key={bucket.name} value={bucket.name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <DatabaseOutlined />
                          {bucket.name} (Created: {formatDate(bucket.creation_date)})
                        </div>
                      </Option>
                    ))}
                  </Select>

                  {bucketsError && (
                    <Alert
                      message="Failed to load S3 buckets"
                      description={bucketsError instanceof Error ? bucketsError.message : 'Unknown error'}
                      type="error"
                      showIcon
                      style={{ marginBottom: 16, borderRadius: 8 }}
                    />
                  )}

                  {/* State Files Display */}
                  {selectedBucket && isLoadingStateFiles && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '32px', 
                      color: '#666',
                      background: '#fafafa',
                      borderRadius: 8,
                      border: '1px dashed #d9d9d9'
                    }}>
                      <DatabaseOutlined style={{ fontSize: 24, marginBottom: 8, color: '#1890ff' }} />
                      <div>Scanning bucket for state files...</div>
                    </div>
                  )}

                  {selectedBucket && stateFiles.length > 0 && (
                    <div style={{ 
                      background: '#f6ffed', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      marginTop: '16px',
                      border: '1px solid #b7eb8f'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16, marginRight: 8 }} />
                        <Text strong style={{ color: '#389e0d' }}>
                          Found {stateFiles.length} State File{stateFiles.length !== 1 ? 's' : ''}
                        </Text>
                      </div>
                      <div style={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto', 
                        background: 'white',
                        border: '1px solid #d9f7be', 
                        borderRadius: '6px'
                      }}>
                        {stateFiles.map((file, index) => (
                          <div 
                            key={index} 
                            style={{ 
                              padding: '12px 16px', 
                              borderBottom: index < stateFiles.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}
                          >
                            <div style={{ 
                              fontWeight: 500, 
                              color: '#262626', 
                              marginBottom: '4px',
                              fontSize: 14
                            }}>
                              📄 {file.key}
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              gap: '16px', 
                              fontSize: '12px', 
                              color: '#8c8c8c'
                            }}>
                              <span>{formatFileSize(file.size)}</span>
                              <span>Modified: {formatDate(file.last_modified)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedBucket && !isLoadingStateFiles && stateFiles.length === 0 && (
                    <Alert
                      message="No state files found"
                      description={`The selected bucket '${selectedBucket}' does not contain any Terraform state files.`}
                      type="warning"
                      showIcon
                      style={{ marginTop: 16, borderRadius: 8 }}
                    />
                  )}
                </div>

                {/* Next Step Button */}
                {selectedBucket && stateFiles.length > 0 && (
                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setCurrentStep(1)}
                      icon={<RightOutlined />}
                      style={{ 
                        minWidth: 180,
                        height: 48,
                        borderRadius: 8,
                        fontWeight: 500
                      }}
                    >
                      Continue to Resource Selection
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case 1:
        return (
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <Card 
              style={{ 
                borderRadius: 16,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid #e8e8e8',
                marginBottom: 32
              }}
            >
              <div style={{ 
                padding: '32px 32px 20px 32px',
                borderBottom: '1px solid #f0f0f0',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                color: 'white',
                borderRadius: '16px 16px 0 0',
                marginBottom: 32
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <SecurityScanOutlined style={{ fontSize: 32 }} />
                  <div>
                    <Title level={2} style={{ margin: 0, color: 'white' }}>
                      Select AWS Resources
                    </Title>
                    <Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                      Choose which AWS resources you want to analyze for drift
                    </Paragraph>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 32px 32px 32px' }}>
                {/* Selection Summary */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)', 
                  padding: '24px', 
                  borderRadius: '16px', 
                  marginBottom: 32,
                  border: '1px solid #91d5ff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20, marginRight: 12 }} />
                    <Text strong style={{ fontSize: 18, color: '#262626' }}>
                      {selectedCount} of {totalCount} Resources Selected
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    Estimated analysis time: {estimatedTime} minutes
                  </Text>
                </div>

                {/* Quick Selection Presets */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 18, color: '#262626' }}>
                      <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                      Quick Selection Presets
                    </Text>
                  </div>
                  <Space wrap size="large">
                    {presets.map(preset => (
                      <Button
                        key={preset.id}
                        type={activePreset === preset.id ? "primary" : "default"}
                        size="large"
                        onClick={() => handlePresetSelect(preset.id)}
                        style={{ 
                          borderRadius: 12,
                          fontWeight: 500,
                          minWidth: 140,
                          height: 48
                        }}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </Space>
                </div>

                {/* Selection Controls */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: 32,
                  padding: '20px 24px',
                  background: '#fafafa',
                  borderRadius: 12,
                  border: '1px solid #f0f0f0'
                }}>
                  <Space size="large">
                    <Button 
                      icon={<CheckCircleOutlined />} 
                      onClick={handleSelectAll}
                      style={{ borderRadius: 8, height: 40 }}
                    >
                      Select All
                    </Button>
                    <Button 
                      onClick={handleClearAll}
                      style={{ borderRadius: 8, height: 40 }}
                    >
                      Clear All
                    </Button>
                  </Space>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: 16 }}>Show Details</Text>
                    <Switch 
                      checked={showDetails}
                      onChange={setShowDetails}
                    />
                  </div>
                </div>

                {/* Resource Cards */}
                <Row gutter={[24, 24]}>
                  {resourceTypes.map(resource => (
                    <Col xs={24} sm={12} lg={8} key={resource.id}>
                      <Card
                        className={`resource-card ${resource.selected ? 'selected' : ''}`}
                        style={{ 
                          borderColor: resource.selected ? resource.color : '#f0f0f0',
                          borderWidth: resource.selected ? 2 : 1,
                          cursor: 'pointer',
                          borderRadius: 16,
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          background: resource.selected ? `${resource.color}08` : 'white',
                          height: '100%'
                        }}
                        onClick={() => handleResourceToggle(resource.id)}
                        hoverable
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                          <div 
                            style={{ 
                              backgroundColor: resource.color,
                              color: 'white',
                              padding: '16px',
                              borderRadius: '12px',
                              marginRight: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 20
                            }}
                          >
                            {resource.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <Title level={5} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                              {resource.name}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              {resource.category} • {resource.priority} Priority
                            </Text>
                          </div>
                        </div>
                        
                        {showDetails && (
                          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                            <Text type="secondary" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                              {resource.description}
                            </Text>
                          </div>
                        )}
                        
                        {resource.selected && (
                          <div style={{ 
                            position: 'absolute', 
                            top: 16, 
                            right: 16,
                            background: resource.color,
                            color: 'white',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <CheckCircleOutlined style={{ fontSize: 16 }} />
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Start Analysis Button */}
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    padding: '32px',
                    borderRadius: '20px',
                    border: '1px solid #bae7ff',
                    marginBottom: 24
                  }}>
                    <div style={{ marginBottom: 24 }}>
                      <Text strong style={{ fontSize: 20, color: '#262626' }}>
                        🚀 Ready to Start Analysis?
                      </Text>
                      <div style={{ marginTop: 12 }}>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                          {selectedCount > 0 && stateFiles.length > 0 
                            ? `Analyzing ${stateFiles.length} state files across ${selectedCount} resource types`
                            : 'Select resources above to begin analysis'
                          }
                        </Text>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      loading={isAnalyzing}
                      disabled={selectedCount === 0}
                      onClick={handleAnalyze}
                      icon={isAnalyzing ? <ReloadOutlined spin /> : <BarChartOutlined />}
                      style={{ 
                        minWidth: 280,
                        height: 64,
                        borderRadius: 16,
                        background: selectedCount > 0 
                          ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                          : 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: 18,
                        boxShadow: selectedCount > 0 
                          ? '0 6px 16px rgba(82, 196, 26, 0.4)'
                          : '0 4px 12px rgba(24, 144, 255, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isAnalyzing ? 'Starting Analysis...' : 
                       selectedCount > 0 ? '🎯 Start Drift Analysis' : 'Select Resources First'}
                    </Button>
                    
                    {selectedCount === 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Alert
                          message="Please select at least one resource type to analyze"
                          type="warning"
                          showIcon={false}
                          style={{ 
                            borderRadius: 12,
                            background: '#fff7e6',
                            border: '1px solid #ffd591'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 3:
        return currentAnalysisData ? (
          <S3StreamingAnalysis
            analysisData={currentAnalysisData}
            apiBaseUrl={import.meta.env.VITE_DRIFT_ASSIST_URL || 'http://localhost:8001'}
            fileName={currentAnalysisData.fileName}
          />
        ) : (
          <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 64px)', padding: 0 }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '40px 24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
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
                maxWidth: 1200,
                margin: '0 auto'
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
                    <BarChartOutlined style={{ fontSize: 32, color: 'white' }} />
                  </div>
                  <div>
                    <Title level={2} style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '28px' }}>
                      🚀 Live Infrastructure Analysis
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 500 }}>
                      Real-time drift detection • AI-powered analysis • Cloud-native scanning
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                        Processing {stateFiles.length} state files across {selectedCount} resource types in {currentAwsCredentials?.region || 'AWS'}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '40px 24px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Main Analysis Card */}
                <Card style={{ 
                  borderRadius: 16,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: 'none',
                  marginBottom: 32,
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    padding: '32px',
                    color: 'white',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        padding: '16px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <ReloadOutlined spin style={{ fontSize: 28, color: 'white' }} />
                      </div>
                      <div>
                        <Title level={3} style={{ margin: 0, color: 'white', fontWeight: 600 }}>
                          🔍 Infrastructure State Analysis
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                          Analyzing Terraform state files and comparing with live AWS infrastructure
                        </Text>
                      </div>
                    </div>
                    
                    {/* Progress Indicators */}
                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={8}>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.15)', 
                          padding: '20px', 
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          textAlign: 'center'
                        }}>
                          <DatabaseOutlined style={{ fontSize: 28, color: 'white', marginBottom: 12 }} />
                          <div style={{ fontWeight: 700, fontSize: 24, color: 'white', marginBottom: 4 }}>
                            {stateFiles.length}
                          </div>
                          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>State Files</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.15)', 
                          padding: '20px', 
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          textAlign: 'center'
                        }}>
                          <SecurityScanOutlined style={{ fontSize: 28, color: 'white', marginBottom: 12 }} />
                          <div style={{ fontWeight: 700, fontSize: 24, color: 'white', marginBottom: 4 }}>
                            {selectedCount}
                          </div>
                          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Resource Types</div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ 
                          background: 'rgba(255,255,255,0.15)', 
                          padding: '20px', 
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          textAlign: 'center'
                        }}>
                          <CloudOutlined style={{ fontSize: 28, color: 'white', marginBottom: 12 }} />
                          <div style={{ fontWeight: 700, fontSize: 24, color: 'white', marginBottom: 4 }}>
                            {currentAwsCredentials?.region || 'AWS'}
                          </div>
                          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Cloud Region</div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Analysis Steps */}
                  <div style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginTop: 24
                  }}>
                    <Title level={4} style={{ marginBottom: 20, color: 'white', fontWeight: 600 }}>
                      <InfoCircleOutlined style={{ marginRight: 8, color: 'white' }} />
                      Analysis Process
                    </Title>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                        { icon: <DatabaseOutlined />, title: 'Parsing Terraform State Files', desc: 'Extracting resource configurations and metadata', status: 'active' },
                        { icon: <CloudOutlined />, title: 'Querying AWS Resources', desc: 'Fetching current infrastructure state from AWS APIs', status: 'active' },
                        { icon: <SecurityScanOutlined />, title: 'Detecting Configuration Drift', desc: 'Comparing expected vs actual resource configurations', status: 'pending' },
                        { icon: <BarChartOutlined />, title: 'Generating Analysis Report', desc: 'Creating comprehensive drift analysis with recommendations', status: 'pending' }
                      ].map((step, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '16px 20px',
                          background: step.status === 'active' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          border: `1px solid ${step.status === 'active' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`
                        }}>
                          <div style={{ 
                            backgroundColor: step.status === 'active' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            marginRight: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16
                          }}>
                            {step.status === 'active' ? <ReloadOutlined spin /> : step.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: 600, 
                              color: step.status === 'active' ? 'white' : 'rgba(255,255,255,0.7)',
                              marginBottom: '4px',
                              fontSize: 16
                            }}>
                              {step.title}
                            </div>
                            <div style={{ 
                              fontSize: '14px', 
                              color: step.status === 'active' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'
                            }}>
                              {step.desc}
                            </div>
                          </div>
                          {step.status === 'active' && (
                            <Badge 
                              status="processing" 
                              text={<span style={{ color: 'white', fontSize: '12px' }}>In Progress</span>}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center',
                    marginTop: 24,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <InfoCircleOutlined style={{ color: 'white', fontSize: 20, marginRight: 8 }} />
                    <Text strong style={{ fontSize: 16, color: 'white' }}>
                      Estimated completion time: {estimatedTime} minutes
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                        Analysis time depends on the number of resources and state file complexity
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
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

      case 4:
        return analysisResults ? (
          <UnifiedResultsDisplay
            data={analysisResults}
            onReset={handleResetAnalysis}
            apiBaseUrl={import.meta.env.VITE_DRIFT_ASSIST_URL || 'http://localhost:8001'}
          />
        ) : (
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <Card 
              style={{ 
                borderRadius: 16,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid #e8e8e8',
                marginBottom: 32
              }}
            >
              <div style={{ 
                padding: '32px 32px 20px 32px',
                borderBottom: '1px solid #f0f0f0',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                color: 'white',
                borderRadius: '16px 16px 0 0',
                marginBottom: 32
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <CheckCircleOutlined style={{ fontSize: 32 }} />
                  <div>
                    <Title level={2} style={{ margin: 0, color: 'white' }}>
                      Analysis Results
                    </Title>
                    <Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                      View and manage your infrastructure drift analysis
                    </Paragraph>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 32px 32px 32px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)', 
                  padding: '32px', 
                  borderRadius: '16px', 
                  marginBottom: 32,
                  border: '1px solid #b7eb8f',
                  textAlign: 'center'
                }}>
                  <div style={{ marginBottom: 24 }}>
                    <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
                    <Title level={3} style={{ color: '#389e0d', marginBottom: 16 }}>No Analysis Results Yet</Title>
                    <Paragraph style={{ fontSize: 16, color: '#8c8c8c', maxWidth: 600, margin: '0 auto' }}>
                      Complete an infrastructure drift analysis to view detailed results here. 
                      The analysis will identify differences between your Terraform state and actual AWS resources.
                    </Paragraph>
                  </div>
                  
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setCurrentStep(1)}
                    icon={<DatabaseOutlined />}
                    style={{ 
                      minWidth: 240,
                      height: 56,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 16
                    }}
                  >
                    Start New Analysis
                  </Button>
                </div>

                {/* What to expect section */}
                <div style={{ 
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  borderRadius: '16px',
                  padding: '32px',
                  marginBottom: 32
                }}>
                  <Title level={4} style={{ marginBottom: 24, color: '#262626', fontWeight: 600 }}>
                    <InfoCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    What to Expect in Analysis Results
                  </Title>
                  
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                      <div style={{ 
                        padding: '24px', 
                        background: '#f6ffed', 
                        borderRadius: '12px',
                        height: '100%',
                        border: '1px solid #b7eb8f'
                      }}>
                        <div style={{ 
                          backgroundColor: '#52c41a',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          width: 'fit-content',
                          marginBottom: '16px'
                        }}>
                          <BarChartOutlined style={{ fontSize: 20 }} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: '#389e0d' }}>
                          Drift Statistics
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: 14 }}>
                          Comprehensive metrics on detected drift across your infrastructure resources
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div style={{ 
                        padding: '24px', 
                        background: '#e6f7ff', 
                        borderRadius: '12px',
                        height: '100%',
                        border: '1px solid #91d5ff'
                      }}>
                        <div style={{ 
                          backgroundColor: '#1890ff',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          width: 'fit-content',
                          marginBottom: '16px'
                        }}>
                          <SecurityScanOutlined style={{ fontSize: 20 }} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: '#096dd9' }}>
                          Resource Changes
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: 14 }}>
                          Detailed comparison between expected and actual resource configurations
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div style={{ 
                        padding: '24px', 
                        background: '#fff2e8', 
                        borderRadius: '12px',
                        height: '100%',
                        border: '1px solid #ffbb96'
                      }}>
                        <div style={{ 
                          backgroundColor: '#fa8c16',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          width: 'fit-content',
                          marginBottom: '16px'
                        }}>
                          <InfoCircleOutlined style={{ fontSize: 20 }} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8, color: '#d46b08' }}>
                          Recommendations
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: 14 }}>
                          AI-powered suggestions to resolve drift and improve infrastructure management
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Tips section */}
                <Alert
                  message="Pro Tip: Regular Drift Analysis"
                  description="Regular infrastructure drift analysis helps maintain consistency between your IaC definitions and actual cloud resources, preventing unexpected behavior and security issues."
                  type="info"
                  showIcon
                  style={{ 
                    borderRadius: 12,
                    marginBottom: 0
                  }}
                />
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="drift-assist-container" style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Connection Status */}
      {currentSessionId && (
        <Alert
          message={`Connected to AWS (${currentAwsCredentials?.region || 'Unknown Region'})`}
          type="success"
          showIcon
          icon={<CloudOutlined />}
          action={
            <Button 
              size="small" 
              icon={<DisconnectOutlined />} 
              onClick={onClose || handleDisconnect}
              title="Disconnect from AWS"
              aria-label="Disconnect from AWS"
            >
              Disconnect
            </Button>
          }
          style={{ margin: '24px 24px 0 24px', borderRadius: 8 }}
        />
      )}

      {/* Progress Steps */}
      <div style={{ padding: '32px 24px 0 24px', background: 'white', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Steps
            current={currentStep}
            items={steps}
            size="default"
            style={{ marginBottom: 24 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div style={{ padding: '24px' }}>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default DriftAssist;
