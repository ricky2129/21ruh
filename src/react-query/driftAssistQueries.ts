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
  const response = await fetch(DriftAssistUrl.CONNECT_AWS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || 'Failed to connect to AWS');
  }

  return response.json();
};

const getS3Buckets = async (sessionId: string): Promise<GetS3BucketsResponse> => {
  const response = await fetch(`${DriftAssistUrl.GET_S3_BUCKETS}/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail?.details || errorData.detail || errorData.error || 'Failed to load S3 buckets');
  }

  return response.json();
};

const getStateFiles = async (sessionId: string, bucketName: string): Promise<GetStateFilesResponse> => {
  const response = await fetch(`${DriftAssistUrl.GET_STATE_FILES}/${sessionId}/${bucketName}/state-files`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 404) {
      throw new Error(errorData.detail?.details || errorData.detail || `Selected bucket '${bucketName}' has no state files.`);
    }
    throw new Error(errorData.detail?.details || errorData.detail || errorData.error || 'Failed to scan bucket for state files');
  }

  return response.json();
};

const analyzeBucket = async (data: AnalyzeBucketRequest): Promise<AnalyzeBucketResponse> => {
  const response = await fetch(DriftAssistUrl.ANALYZE_BUCKET, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || errorData.error || 'Failed to analyze S3 state files');
  }

  return response.json();
};

// React Query Hooks
export const useConnectToAWS = () => {
  return useMutation({
    mutationFn: connectToAWS,
    mutationKey: [QUERY_KEY.CONNECT_AWS],
  });
};

export const useGetS3Buckets = (sessionId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_S3_BUCKETS, sessionId],
    queryFn: () => getS3Buckets(sessionId),
    enabled: enabled && !!sessionId,
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
