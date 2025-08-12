export interface CreateDeploymentRequest {
  repo_url: string;
  deployment_name: string;
  pat_token: string;
}

export interface DeploymentResponse {
  deployment_name: string;
  [key: string]: any;
}

export interface InstrumentResponse {
  status: string;
  [key: string]: any;
}

export interface Deployment {
  repo_url: string;
  status: string;
  deployment_name: string;
  last_updated: string | null;
  pat_token_provided: boolean;
  id: number;
  created_at: string;
}

export interface GrafanaDashboardPanel {
  id: number;
  title: string;
  type: string; 
  datasource: {
    type: string; 
    uid: string;
  };
  targets: Array<{
    expr: string;
    legendFormat?: string;
    [key: string]: any;
  }>;
  gridPos: {
    h: number;
    w: number;
    x: number;
    y: number;
  };
  fieldConfig?: {
    defaults?: {
      unit?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any; 
}


export interface GrafanaDashboardRequest {
  dashboard: {
    id: number | null;
    uid: string;
    title: string;
    panels: GrafanaDashboardPanel[];
    time: {
      from: string;
      to: string;
    };
    refresh: string;
    schemaVersion: number;
    version: number;
  };
  folderId: number;
  overwrite: boolean;
}

export interface GrafanaDashboardResponse {
  id: number;
  uid: string;
  url: string;
  status: string;
  version: number;
}