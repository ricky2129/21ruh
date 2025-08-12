import {
  CloudSignInFormConstantType,
  ConfigureGremlinFormConstantType,
  GremlinSignInFormConstantType,
  RepositorySignInFormConstantType,
} from "interfaces";

export const regions: string[] = [
  "us-east-2",
  "us-east-1",
  "us-west-1",
  "us-west-2",
  "af-south-1",
  "ap-east-1",
  "ap-south-2",
  "ap-southeast-3",
  "ap-southeast-5",
  "ap-southeast-4",
  "ap-south-1",
  "ap-northeast-3",
  "ap-northeast-2",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ca-central-1",
  "ca-west-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-south-1",
  "eu-west-3",
  "eu-south-2",
  "eu-north-1",
  "eu-central-2",
  "il-central-1",
  "me-south-1",
  "me-central-1",
  "sa-east-1",
  "us-gov-east-1",
  "us-gov-west-1",
];

export const CloudSignInFormConstants: CloudSignInFormConstantType = {
  SECRET_NAME: {
    NAME: "secret_name",
    LABEL: "Name",
    PLACEHOLDER: "Type here",
    ERROR: "Name is required",
    TYPE: "text",
  },
  ACCOUNT_ID: {
    NAME: "account_id",
    LABEL: "Account ID",
    PLACEHOLDER: "Type here",
    ERROR: "Account ID is required",
    TYPE: "text",
  },
  USER_ACCESS_KEY: {
    NAME: "user_access_key",
    LABEL: "IAM user access key",
    PLACEHOLDER: "Type here",
    ERROR: "User access is required",
    TYPE: "password",
  },
  USER_SECRET_KEY: {
    NAME: "user_secret_key",
    LABEL: "IAM user secret key",
    PLACEHOLDER: "Type here",
    ERROR: "User Secret Key is required",
    TYPE: "password",
  },

  REGION: {
    NAME: "region",
    LABEL: "Region",
    PLACEHOLDER: "Type here",
    ERROR: "Region is required",
    TYPE: "text",
  },

  ACCESS: {
    NAME: "access",
    LABEL: "Access",
    ERROR: "Access is required",
    TYPE: "text",
  },

  TAGS: {
    NAME: "tags",
    LABEL: "",
    ERROR: "Input must be space separate text pairs",
    TYPE: "text",
    PLACEHOLDER: "Enter tags (eg: Team:Alpha)",
  },
};

export const RepositorySignInFormConstants: RepositorySignInFormConstantType = {
  SECRET_NAME: {
    NAME: "secret_name",
    LABEL: "Name",
    PLACEHOLDER: "Type here",
    ERROR: "Name is required",
    TYPE: "text",
  },

  USER_NAME: {
    NAME: "user_name",
    LABEL: "Repo Username",
    PLACEHOLDER: "Type here",
    ERROR: "Name is required",
    TYPE: "text",
  },

  TOKEN: {
    NAME: "token",
    LABEL: "CLI token",
    PLACEHOLDER: "Type here",
    ERROR: "Token is required",
    TYPE: "password",
  },

  REPOSITORY_URL: {
    NAME: "repository_url",
    LABEL: "Select Repository URL",
    TYPE: "text",
    PLACEHOLDER: "Repository Url",
    ERROR: "Repository URL is not valid",
  },

  ACCESS: {
    NAME: "access",
    LABEL: "Access",
    ERROR: "Access is required",
    TYPE: "text",
  },

  TAGS: {
    NAME: "tags",
    LABEL: "",
    ERROR: "Input must be space separate text pairs",
    TYPE: "text",
    PLACEHOLDER: "Enter tags (eg: Team:Alpha)",
  },
};

export const GremlinSignInFormConstants: GremlinSignInFormConstantType = {
  NAME: {
    NAME: "name",
    LABEL: "Name",
    PLACEHOLDER: "Type here",
    ERROR: "Name is required",
    TYPE: "text",
  },
  GREMLIN_ACCESS_KEY: {
    NAME: "gremlin_access_key",
    LABEL: "Gremlin / Access Key",
    PLACEHOLDER: "Type here",
    ERROR: "Access Key is required",
    TYPE: "password",
  },

  ACCESS: {
    NAME: "access",
    LABEL: "Access",
    ERROR: "Access is required",
    TYPE: "text",
  },

  TAGS: {
    NAME: "tags",
    LABEL: "",
    ERROR: "Input must be space separate text pairs",
    TYPE: "text",
    PLACEHOLDER: "Enter tags (eg: Team:Alpha)",
  },
};

export const ConfigureGremlinFormConstants: ConfigureGremlinFormConstantType = {
  ACCOUNT: {
    NAME: "gremlin_integration_id",
    LABEL: "Select Account",
    PLACEHOLDER: "Select",
    ERROR: "Account is required",
  },
};
