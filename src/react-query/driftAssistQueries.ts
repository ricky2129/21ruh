import { useMutation, useQuery } from "@tanstack/react-query";
import { DriftAssistUrl } from "constant/url.constant";
import { QUERY_KEY } from "constant/queryKey.constants";

// Types based on original project
interface AWSCredentials {
  access_key: string;
  secret_key: string;
}

interface ConnectAWSRequest {
  provider: string;
  credentials: AWSCredentials;
  region: string;
}

interface ConnectAWSResponse {
  session_id: string;
}

interface S3Bucket {
  name: string;
  creation_date: string;
}

interface GetS3BucketsResponse {
  buckets: S3Bucket[];
}

interface StateFile {
  key: string;
  size: number;
  last_modified: string;
}

interface GetStateFilesResponse {
  state_files: StateFile[];
}

interface AnalyzeBucketRequest {
  session_id: string;
  bucket_name: string;
  selected_resources: string[];
}

interface AnalyzeBucketResponse {
  status: string;
  bucket_name: string;
  total_files: number;
  successful_analyses: number;
  failed_analyses: number;
  analysis_results: Array<{
    file_name: string;
    file_key: string;
    status: string;
    error?: string;
    size: number;
    last_modified: string;
    analysis_data?: any;
    terraform_analysis?: any;
  }>;
  type: string;
  intelligent_analysis: boolean;
}

// API Functions
const connectToAWS = async (data: ConnectAWSRequest): Promise<ConnectAWSResponse> => {
  console.log('🔐 DRIFT ASSIST DEBUG: connectToAWS called');
  console.log('📍 Backend URL:', DriftAssistUrl.CONNECT_AWS);
  console.log('📤 Request payload:', JSON.stringify(data, null, 2));
  console.log('📤 Request details:', {
    provider: data.provider,
    region: data.region,
    hasCredentials: !!data.credentials,
    hasAccessKey: !!data.credentials?.access_key,
    hasSecretKey: !!data.credentials?.secret_key,
    accessKeyLength: data.credentials?.access_key?.length,
    secretKeyLength: data.credentials?.secret_key?.length,
    accessKeyPrefix: data.credentials?.access_key?.substring(0, 4)
  });

  const response = await fetch(DriftAssistUrl.CONNECT_AWS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('📥 Response status:', response.status);
  console.log('📥 Response headers:', response.headers);

  if (!response.ok) {
    const responseText = await response.text();
    console.error('❌ Error response body (raw):', responseText);
    
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { error: 'Invalid JSON response', raw: responseText };
    }
    
    console.error('❌ Parsed error:', errorData);
    console.error('❌ Request that failed:', {
      url: DriftAssistUrl.CONNECT_AWS,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2)
    });
    
    throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('✅ Success response:', result);
  return result;
};

const getS3Buckets = async (sessionId: string): Promise<GetS3BucketsResponse> => {
  console.log('🪣 API: getS3Buckets called with:', {
    sessionId,
    url: `${DriftAssistUrl.GET_S3_BUCKETS}/${sessionId}`
  });

  const response = await fetch(`${DriftAssistUrl.GET_S3_BUCKETS}/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('🪣 API: getS3Buckets response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ API: getS3Buckets failed:', errorData);
    throw new Error(errorData.detail?.details || errorData.detail || errorData.error || 'Failed to load S3 buckets');
  }

  const result = await response.json();
  console.log('✅ API: getS3Buckets success:', { bucketCount: result.buckets?.length || 0 });
  return result;
};

const getStateFiles = async (sessionId: string, bucketName: string): Promise<GetStateFilesResponse> => {
  console.log('📄 API: getStateFiles called with:', {
    sessionId,
    bucketName,
    url: `${DriftAssistUrl.GET_STATE_FILES}/${sessionId}/${bucketName}/state-files`
  });

  const response = await fetch(`${DriftAssistUrl.GET_STATE_FILES}/${sessionId}/${bucketName}/state-files`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('📄 API: getStateFiles response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ API: getStateFiles failed:', errorData);
    if (response.status === 404) {
      throw new Error(errorData.detail?.details || errorData.detail || `Selected bucket '${bucketName}' has no state files.`);
    }
    throw new Error(errorData.detail?.details || errorData.detail || errorData.error || 'Failed to scan bucket for state files');
  }

  const result = await response.json();
  console.log('✅ API: getStateFiles success:', { 
    stateFileCount: result.state_files?.length || 0,
    files: result.state_files?.map(f => f.key) || []
  });
  return result;
};

const analyzeBucket = async (data: AnalyzeBucketRequest): Promise<AnalyzeBucketResponse> => {
  console.log('🔍 API: analyzeBucket called with:', {
    sessionId: data.session_id,
    bucketName: data.bucket_name,
    selectedResources: data.selected_resources,
    resourceCount: data.selected_resources.length,
    url: DriftAssistUrl.ANALYZE_BUCKET
  });

  const response = await fetch(DriftAssistUrl.ANALYZE_BUCKET, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('🔍 API: analyzeBucket response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ API: analyzeBucket failed:', errorData);
    throw new Error(errorData.details || errorData.error || 'Failed to analyze S3 state files');
  }

  const result = await response.json();
  console.log('✅ API: analyzeBucket success:', {
    status: result.status,
    totalFiles: result.total_files,
    successfulAnalyses: result.successful_analyses,
    failedAnalyses: result.failed_analyses,
    analysisResultsCount: result.analysis_results?.length || 0
  });
  return result;
};

// React Query Hooks
export const useConnectToAWS = () => {
  return useMutation({
    mutationFn: connectToAWS,
    mutationKey: [QUERY_KEY.CONNECT_AWS],
  });
};

export const useGetS3Buckets = (sessionId: string, enabled: boolean = true) => {
  console.log('🪣 useGetS3Buckets called:', { 
    sessionId, 
    enabled, 
    hasSessionId: !!sessionId,
    sessionIdType: typeof sessionId,
    sessionIdValue: sessionId
  });
  
  return useQuery({
    queryKey: [QUERY_KEY.GET_S3_BUCKETS, sessionId],
    queryFn: () => {
      console.log('🪣 Executing getS3Buckets for session:', sessionId);
      return getS3Buckets(sessionId);
    },
    enabled: enabled && !!sessionId && sessionId !== 'undefined' && sessionId !== 'null',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetStateFiles = (sessionId: string, bucketName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_STATE_FILES, sessionId, bucketName],
    queryFn: () => getStateFiles(sessionId, bucketName),
    enabled: enabled && !!sessionId && !!bucketName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAnalyzeBucket = () => {
  return useMutation({
    mutationFn: analyzeBucket,
    mutationKey: [QUERY_KEY.ANALYZE_BUCKET],
  });
};

// Legacy hook for backward compatibility (if needed)
export const useCreateDriftAnalysis = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      // This can be removed or adapted based on your needs
      throw new Error('Use the new AWS-based drift analysis flow');
    },
  });
};

// Export types for use in components
export type {
  AWSCredentials,
  ConnectAWSRequest,
  ConnectAWSResponse,
  S3Bucket,
  GetS3BucketsResponse,
  StateFile,
  GetStateFilesResponse,
  AnalyzeBucketRequest,
  AnalyzeBucketResponse,
};
