export type ScanStatusType = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "PROCESSED";

export interface CloneRepoRequest {
  name: string,
  branch: string;
  app_service_id: number;
  github_integration_id: number;
  aws_integration_id: string;
}

export interface FetchCodeScanDashboardResponse {
  totalUniqueFiles: number;
  totalUniqueAntipatterns: number;
  remediatedFunctionsCount: number;
}

export interface CodeScansResponse {
  service_id: number;
  branch_name: string;
  repo_type: string;
  status: ScanStatusType;
  last_scanned_time: string;
  id: number;
  version: number;
  initiated_time: string;
}

export interface FetchCodeScanResponse {
  doc_id: string;
  antipatterns: string[];
  file_path: string;
  functionName: string;
  currentImplementation: string;
  remediatedImplementation?: string;
  isActionTaken: boolean;
  model: string;
}

export interface TotalVersionsResponse {
  service_id: string;
  versions: number[];
}

export interface AntiPatternSummaryData {
  id: number;
  fileName: string;
  totalAntiPatterns: number;
  resolvedAntiPatterns: number;
}

export interface FileData {
  fileName: string;
  scanStatus: "SUCCESS" | "RUNNING";
}

export interface UpdateActionRequest {
  doc_id: string;
  isActionTaken: boolean;
}
