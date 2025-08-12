export interface ConfigureExperimentFormFieldType {
  experiment_name: string;
  scenario_name: string;
  agent: number;
  health_check?: number;
}

export interface ConfigureExperimentFormFields {
  EXPERIMENT_NAME: {
    NAME: "experiment_name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  SCENARIO_NAME: {
    NAME: "scenario_name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  AGENT: {
    NAME: "agent";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  HEALTH_CHECK: {
    NAME: "health_check";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };
}

export interface MetricData {
  timestamp: number;
  value: number;
}

export interface Metric {
  status: "PARTIAL" | "COMPLETE" | "FAILED" | "NO_DATA";
  task_id: string | null;
  chart_title: string;
  metric_data: MetricData[];
}

export interface GraphDetail {
  start_time: string;
  end_time: string
}

export interface GraphNodeDetails {
  start_time: string,
  end_time: string
}

export interface GraphNodes {
  lifecycle: "Successful" | "NotStarted" | "HaltedRequested";
  time: number;
  target: number | object;
  target_name: string | object;
  target_type: string | object;
  metric?: Metric;
  start_time?: string;
  end_time?: string;
  agent_version: string;
  agent_name: string;
}

export interface ChaosDataResponse {
  _id: string;
  service_env_id: string;
  version: string;
  metrics: Metric[];
  result: {
    created_at: string;
    updated_at: string;
    experiment_name: string;
    agent_name: [string];
    final_stage: "Active" | "Completed" | "Halted" | "NotStarted" | null;
  };

  graph_nodes: GraphNodes[];
  graph_node_details: GraphNodeDetails[]
}

export interface CreateExperimentRequest {
  experiment_name: string;
  app_service_id: string;
  scenario_name: string;
  health_check?: string;
  agent: {
    name: string;
    local_ip: string;
    os_type: string;
    zone: string;
    target: string;
  };
}

export interface AgentsResponse {
  agent_name: string;
  agent_local_ip: string;
  agent_os_type: string;
  agent_zone: string;
  target_type: string;
  stage: "Active" | "Inactive";
}

export interface ChaosVersionResponse {
  name: string;
  version: number[] | string[];
}

export interface HealthCheckResponse {
  team_id: string;
  identifier: string;
  "health-check-name": string;
}
