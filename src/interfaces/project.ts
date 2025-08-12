export type ProjectVisibility = "private" | "internal" | "public";

export interface Project {
  id: number;
  org_id: number;
  name: string;
  description: string;
  visibility: ProjectVisibility;
  applications: any[];
  is_favorite: boolean;
  data: any;
  count: number;
}

export interface Tag {
  key: string;
  value: string;
  tag_type?: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  visibility: string;
  tags: Tag[];
}

export interface CreateProjectResponse {
  message: string;
  project_id: number
}

export interface MemberRequest {
  user_id: number;
  role_id: number;
  project_id: number
}

export interface TeamRequest {
  team_id: number;
  role_id: number;
  project_id: number
}

export interface EmailNotificationRequest {
  name: string;
  recipients: string[];
  trigger: string[];
  project_id: number
  published: boolean
}

export interface BasicDetailsFormField {
  project_name: string;
  project_description: string;
  primary_tag: Tag[];
  secondary_tag: Tag[];
  privacy: "Internal" | "Private";
}

export type SLOTargetLevelType = "Low" | "Medium" | "High";

export type SLOTargetUnitType = "Level" | "Min" | "%";

export type SLOCriteriaType = ">" | ">=" | "<=" | "<" | "=" | "!=";

export interface SLOType {
  key: string;
  name: string;
  kpi?: {
    id: string;
    title: string;
    subtitle?: string;
  };
  target: {
    value: number | SLOTargetLevelType;
    unit: SLOTargetUnitType;
    criteria?: SLOCriteriaType;
  };
  application_tags: Tag[];
}

export interface SloAndErrorBudgetConstantType {
  ACCOUNT: {
    NAME: "account";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };
}

export interface SLOFormType {
  name: string;
  kpi_id: number;
  target_value: string;
  target_criteria?: SLOCriteriaType;
  application_tags: Tag[];
}

export interface SLOAndErrorBudgetFormField {
  account: number
}

export interface GrantAccessUserFormField {
  id: number;
  user_id: string;
  user_name: string;
  email: string;
  role_id: number;
}

export interface GrantAccessTeamFormField {
  id?: number,
  team_id: number;
  role_id: number;
}

export interface EmailNotificationFormField {
  id: string;
  name: string;
  recipients: string[];
  isPublish: boolean;
  trigger: string[];
}

export interface AccessListReponse {
  "users": GrantAccessUserFormField[],
  "teams": GrantAccessTeamFormField[]
}