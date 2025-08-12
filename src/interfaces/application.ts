import { Dayjs } from "dayjs";

import { AppServiceType, Environment } from "./infra";
import { Tag } from "./project";

export interface Service {
  id: number;
  name: AppServiceType;
}

export interface Application {
  id: number;
  name: string;
  data?: {
    rto: number;
    rpo: number;
    resiliency: boolean;
  };
  services: {
    id: number;
    name: string;
  }[];
  tags: {
    id: number;
    key: string;
    value: string;
  }[];
}

export interface ApplicationDetails {
  id: number;
  org_id: number;
  created_by: number;
  name: string;
  description: string;
  project_id: number;
  services: {
    id: number;
    service: string;
    environments: Environment[];
  }[];
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface ConfigureInfraFormFields {
  advanced: boolean;
  environment_name: string;
  aws_account: string;
  resource: string;
  cloudformation_stack: string[];
  rto_rpo: string;
  schedule_assesment: string;
  frequency: string;
  date: Dayjs;
  time: Dayjs;
  drift_notification: boolean;
}

export interface ConfigureInfraFormType {
  ENVIRONMENT_NAME: {
    NAME: "environment_name";
    LABEL: string;
    TYPE: string;
    PLACEHOLDER: string;
    ERROR: string;
  };
  AWS_ACCOUNT: {
    NAME: "aws_account";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
  };
  RESOURCE: {
    NAME: "resource";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
  };
  CLOUDFORMATION_STACK: {
    NAME: "cloudformation_stack";
    LABEL: string;
    SUBLABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
  };
  RESILIENCY_POLICY: {
    NAME: "rto_rpo";
    LABEL: string;
    SUBLABEL: string;
    CHOOSE: {
      LABEL: string;
      PLACEHOLDER: string;
    };
    CREATE: {
      LABEL: string;
      BUTTON_NAME: string;
    };
    ERROR: string;
  };
  SCHEDULE_ASSESMENT: {
    NAME: "schedule_assesment";
    LABEL: string;
    SUBLABEL: string;
    ADVANCED: "advanced";
    FREQUENCY: {
      NAME: "frequency";
      LABEL: string;
      PLACEHOLDER: string;
      ERROR: string;
    };
    DATE: {
      NAME: "date";
      LABEL: string;
      PLACEHOLDER: string;
      ERROR: string;
    };
    TIME: {
      LABEL: string;
      NAME: "time";
      ERROR: string;
    };
    DRIFT_NOTIFICATION: {
      NAME: "drift_notification";
      LABEL: string;
    };
  };
}

export interface CreateResilienctPolicyFormFields {
  name: string;
  advanced: boolean;

  rto: number;
  rto_unit: string;
  rpo: number;
  rpo_unit: string;

  infrastructure_rto: number;
  infrastructure_rto_unit: string;
  infrastructure_rpo: number;
  infrastructure_rpo_unit: string;

  application_rto: number;
  application_rto_unit: string;
  application_rpo: number;
  application_rpo_unit: string;
  application_resiliency: boolean;

  az_rto: number;
  az_rto_unit: string;
  az_rpo: number;
  az_rpo_unit: string;
}

export interface CreateResilienctPolicyFormType {
  RESILIENCY_POLICY: {
    LABEL: string;
    LABEL_EDIT: string;
    NAME: {
      NAME: "name";
      LABEL: string;
      PLACEHOLDER: string;
      ERROR: string;
    };
    TARGET: {
      LABEL: string;
      SUBLABEL: string;
    };
    RTO: {
      LABEL: string;
      NAME: "rto";
      UNIT_NAME: "rto_unit";
      PLACEHOLDER: number;
      ERROR: string;
    };
    RPO: {
      LABEL: string;
      NAME: "rpo";
      UNIT_NAME: "rpo_unit";
      PLACEHOLDER: number;
      ERROR: string;
    };
    ADVANCED: "advanced";
  };
  RESILIENCY_POLICY_INFRASTRUCTURE: {
    LABEL: string;
    RTO: {
      LABEL: string;
      NAME: "infrastructure_rto";
      UNIT_NAME: "infrastructure_rto_unit";
      PLACEHOLDER: number;
      ERROR: string;
    };
    RPO: {
      LABEL: string;
      NAME: "infrastructure_rpo";
      UNIT_NAME: "infrastructure_rpo_unit";
      PLACEHOLDER: number;
      ERROR: string;
    };
  };
  RESILIENCY_POLICY_APPLICATION: {
    LABEL: string;
    RTO: {
      LABEL: string;
      NAME: "application_rto";
      UNIT_NAME: "application_rto_unit";
      PLACEHOLDER: number;
      ERROR: string;
    };
    RPO: {
      LABEL: string;
      NAME: "application_rpo";
      UNIT_NAME: "application_rpo_unit";
      PLACEHOLDER: number;
      ERROR: string;
    };
  };
  RESILIENCY_POLICY_AZ: {
    LABEL: string;
    RTO: {
      LABEL: string;
      NAME: "az_rto";
      UNIT_NAME: "az_rto_unit";
      PLACEHOLDER: number;
      ERROR: string;
    };
    RPO: {
      LABEL: string;
      NAME: "az_rpo";
      UNIT_NAME: "az_rpo_unit";
      PLACEHOLDER: number;
      ERROR: string;
    };
  };
}

export interface CreateResiliencyPolicyRequest {
  integration_id: number;
  policy_name: string;
  application_rpo_in: number;
  application_rto_in: number;
  infrastructure_rpo_in: number;
  infrastructure_rto_in: number;
  availability_zone_rpo_in: number;
  availability_zone_rto_in: number;
}

export interface CreateResiliencyPolicyResponse {
  policyName: string;
  policyArn: string;
}

export interface BasicDetailsApplicationFormField {
  application_name: string;
  application_description: string;
  primary_tag: Tag[];
  secondary_tag: Tag[];
  integrations: number[];
  privacy: string;
}

export interface BasicDetailsConstants {
  TITLE: string;
  APPLICATION_NAME: {
    NAME: "application_name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
    AVAILABILITY_ERROR: string;
  };
  APPLICATION_DESCRIPTION: {
    NAME: "application_description";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };
  PRIMARY_TAGS: {
    NAME: "primary_tag";
    LABEL: string;
  };
  SECONDARY_TAGS: {
    NAME: "secondary_tag";
    LABEL: string;
  };
  PRIVACY: {
    NAME: "privacy";
    LABEL: string;
    TYPE: "text";
    ERROR: string;
  };
}

export interface ConfigureRepositoriesFormField {
  name: string;
  repository_name: string;
  repository_url: string;
  aws_account: string;
  github_account: string;
  branch_name: string;
  repo_username: string;
  cli_token: string;
}

export interface CreateApplicationRequest {
  name: string;
  description: string;
  project_id: number;
  tags: Tag[];
  privacy: string;
}

export interface AddMemberRequest {
  application_id: number;
  role_id: number;
  user_id: number;
}

export interface TeamApplicationRequest {
  application_id: number;
  role_id: number;
  team_id: number;
}

export interface AddSloRequest {
  name: string;
  kpi_id: number;
  target_criteria: string;
  target_value: string;
  application_id: number;
}

export interface AddServiceToApplicationRequest {
  application_id: number;
  service_id: number;
  integration_id?: number;
}

export interface AddServiceToApplicationResponse {
  message: string;
  app_service_id: number;
}
