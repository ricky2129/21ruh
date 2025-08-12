export type InfraResources = { [key: string]: string };

export interface InfraResource {
  id: string;
  name: string;
  description: string;
}

export type AppServiceType = "Infrastructure" | "Repositories" | "Experiments" | "DriftAssist";

export const AppServiceMap: Record<AppServiceType, number> = {
  Infrastructure: 1,
  Repositories: 2,
  Experiments: 3,
  DriftAssist: 8,
};

export interface Environment {
  id: number;
  name: string; // TODO: Map it to AppService
  app_service_id: number;
  integration_id: number;
}

export interface CreateEnvironmentRequest {
  app_service_id: number;
  environment: string;
  integration_id: number;
  resiliency_policy_arn: string;
  resource_group_arns: InfraResource[];
}

export interface CreateEnvironmentResponse {
  service_env_id: number;
}

export interface CreateInfraScheduleRequest {
  service_env_id: number;
  frequency: string;
  date: string;
  time: string;
}

export interface CreateResourceGroupRequest {
  integration_id: number;
  name: string;
  description: string;
  tags: ResourceTypeTag[];
}

export interface ConfigureResourceFormFields {
  name: string;
  description: string;
  tags: { Key: string; Values: string }[];
  criticality: number;
  owner: string;
  display_name: string;
}

export interface ResourceTypeTag {
  Key: string;
  Values: string[];
}

export interface ListResourceGroupRequest {
  integration_id: number;
  tags: ResourceTypeTag[];
}

export interface ListResourceGroupResponse {
  ResourceArn: string;
  ResourceType: string;
}

export interface ConfigureResourceFormFieldConstantType {
  NAME: {
    NAME: "name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  DESCRIPTION: {
    NAME: "description";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR?: string;
  };

  TAGS: {
    NAME: "tags";
    LABEL: string;
  };
}
