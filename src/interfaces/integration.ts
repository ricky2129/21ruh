import { Tag } from "./project";

export interface CloudSignInFormField {
  integration_id?: number;
  secret_name: string;
  user_access_key: string;
  user_secret_key: string;
  region: string;
  access: "Internal" | "Specific";
  tags: Tag[];
}

export interface RepoResponse {
  username: string;
  token: string;
  repo_url: string;
}

export interface CloudResponse {
  AWS_SECRET_ACCESS_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_DEFAULT_REGION: string;
}

export interface GremlinResponse {
  apikey: string;
}

export interface GremlinSignInFormFields {
  integration_id?: number;
  name: string;
  gremlin_access_key: string;
  access: "Internal" | "Specific";
  tags: Tag[];
}

export interface ConfigureGremlinFormFields {
  gremlin_integration_id: string;
}

export interface RepositorySignInFormFields {
  integration_id?: string;
  secret_name: string;
  user_name: string;
  token: string;
  repository_url: string;
  tags: Tag[];
  access: "Internal" | "Specific";
}

export interface RepositorySignInRequest {
  name: "string";
  project_id: number;
  secret: {
    username: string;
    token: string;
    repo_url: string;
  };
  access: string;
  tags: Tag[];
}

export interface AWSSignInRequest {
  name: string;
  project_id: number;
  secret: {
    AWS_SECRET_ACCESS_KEY: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_DEFAULT_REGION: string;
  };
  access: string;
  tags: Tag[];
}

export interface GremlinSignInRequest {
  name: string;
  project_id: number;
  secret: {
    apikey: string;
  };
  access: string;
  tags: Tag[];
}

export interface UpdateIntegrationRequest {
  name: string;
  integration_id: number;
  aws?: {
    AWS_SECRET_ACCESS_KEY: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_DEFAULT_REGION: string;
  };
  github?: {
    username: string;
    token: string;
    repo_url: string;
  };
  gremlin?: {
    apikey: string;
  };
}

export interface SecretResponse {
  org_id: number;
  infrastructure_id: number;
  name: string;
  id: number; // integration_id
  secret_manager_key: string;
  updated_at: string;
  created_at: string;
  deleted_at: string;
  project_id: number;
  access: "Internal" | "Specific";
}

export interface CloudSignInFormConstantType {
  SECRET_NAME: {
    NAME: "secret_name";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "text";
  };

  ACCOUNT_ID: {
    NAME: "account_id";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "text";
  };

  USER_ACCESS_KEY: {
    NAME: "user_access_key";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "password";
  };

  USER_SECRET_KEY: {
    NAME: "user_secret_key";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "password";
  };

  REGION: {
    NAME: "region";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "text";
  };

  ACCESS: {
    NAME: "access";
    LABEL: string;
    ERROR: string;
    TYPE: string;
  };

  TAGS: {
    NAME: "tags";
    LABEL: string;
    ERROR: string;
    TYPE: string;
    PLACEHOLDER: string;
  };
}

export interface RepositorySignInFormConstantType {
  SECRET_NAME: {
    NAME: "secret_name";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "text";
  };

  USER_NAME: {
    NAME: "user_name";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "text";
  };

  TOKEN: {
    NAME: "token";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "password";
  };

  REPOSITORY_URL: {
    NAME: "repository_url";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  ACCESS: {
    NAME: "access";
    LABEL: string;
    ERROR: string;
    TYPE: string;
  };

  TAGS: {
    NAME: "tags";
    LABEL: string;
    ERROR: string;
    TYPE: string;
    PLACEHOLDER: string;
  };
}

export interface GremlinSignInFormConstantType {
  NAME: {
    NAME: "name";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "text";
  };

  GREMLIN_ACCESS_KEY: {
    NAME: "gremlin_access_key";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "password";
  };

  ACCESS: {
    NAME: "access";
    LABEL: string;
    ERROR: string;
    TYPE: string;
  };

  TAGS: {
    NAME: "tags";
    LABEL: string;
    ERROR: string;
    TYPE: string;
    PLACEHOLDER: string;
  };
}

export interface ConfigureGremlinFormConstantType {
  ACCOUNT: {
    NAME: "gremlin_integration_id";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
  };
}
