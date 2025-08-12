import { BasicDetailsConstants, ConfigureInfraFormType, ConfigureResourceFormFieldConstantType, CreateResilienctPolicyFormType } from "interfaces";


interface ConfigureRepositoryConstantType {
  NAME: {
    NAME: "name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  BRANCH_NAME: {
    NAME: "branch_name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  REPO_USERNAME: {
    NAME: "repo_username";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  REPOSITORY_NAME: {
    NAME: "repository_name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  CLI_TOKEN: {
    NAME: "cli_token";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  REPOSITORY_URL: {
    NAME: "repository_url";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };

  AWS_ACCOUNT: {
    NAME: "aws_account";
    LABEL: string;
    TYPE: string;
    PLACEHOLDER: string;
    ERROR: string;
  };

  GITHUB_ACCOUNT: {
    NAME: "github_account";
    LABEL: string;
    TYPE: string;
    PLACEHOLDER: string;
    ERROR: string;
  };
}

export const emptyApplicationConstants = {
  TITLE: "You have not created any application yet.",
  SUBTITLE: "Please click “Create New Application” button to get stated with.",
};

export const configureInfraFormContants: ConfigureInfraFormType = {
  ENVIRONMENT_NAME: {
    NAME: "environment_name",
    LABEL: "Environment Name ",
    TYPE: "text",
    PLACEHOLDER: "Environment Name",
    ERROR: "Environment Name is required",
  },
  AWS_ACCOUNT: {
    NAME: "aws_account",
    LABEL: "Select AWS Account",
    PLACEHOLDER: "Select",
    ERROR: "AWS Account is required",
  },
  RESOURCE: {
    NAME: "resource",
    LABEL: "Select Tag/Resources",
    PLACEHOLDER: "Select",
    ERROR: "Resource is required",
  },
  CLOUDFORMATION_STACK: {
    NAME: "cloudformation_stack",
    LABEL: "CloudFormation Stack",
    SUBLABEL: "Add a maximum of 5 cloudFormation stacks.",
    PLACEHOLDER: "Select",
    ERROR: "CloudFormation Stack is required",
  },
  RESILIENCY_POLICY: {
    NAME: "rto_rpo",
    LABEL: "Set RTO and RPO",
    SUBLABEL: "description & other details can goes here",
    CHOOSE: {
      LABEL: "Choose an existing resiliency policy",
      PLACEHOLDER: "Select",
    },
    CREATE: {
      LABEL: "Create new resiliency policy",
      BUTTON_NAME: "Create New",
    },
    ERROR: "Resiliency Policy is required",
  },
  SCHEDULE_ASSESMENT: {
    NAME: "schedule_assesment",
    LABEL: "Schedule assessment",
    SUBLABEL: "description & other details can goes here",
    ADVANCED: "advanced",
    FREQUENCY: {
      NAME: "frequency",
      LABEL: "Select Frequency",
      PLACEHOLDER: "Select",
      ERROR: "Frequency is required",
    },
    DATE: {
      NAME: "date",
      LABEL: "Date",
      PLACEHOLDER: "dd/mm/yyyy",
      ERROR: "Date is required",
    },
    TIME: {
      LABEL: "Time",
      NAME: "time",
      ERROR: "Time is required",
    },
    DRIFT_NOTIFICATION: {
      NAME: "drift_notification",
      LABEL: "Drift notification",
    },
  },
};

export const createResiliencyPolicyFormConstants: CreateResilienctPolicyFormType =
  {
    RESILIENCY_POLICY: {
      LABEL: "Create new resiliency policy",
      LABEL_EDIT: "Create new resiliency policy",
      NAME: {
        NAME: "name",
        LABEL: "Name",
        PLACEHOLDER: "Policy name",
        ERROR: "Policy name is required",
      },
      TARGET: {
        LABEL: "RTO/RPO Targets",
        SUBLABEL: "description & other details can goes here",
      },
      RTO: {
        LABEL: "RTO",
        NAME: "rto",
        PLACEHOLDER: 0,
        UNIT_NAME: "rto_unit",
        ERROR: "RTO is required",
      },
      RPO: {
        LABEL: "RPO",
        NAME: "rpo",
        PLACEHOLDER: 0,
        UNIT_NAME: "rpo_unit",
        ERROR: "RPO is required",
      },
      ADVANCED: "advanced",
    },
    RESILIENCY_POLICY_INFRASTRUCTURE: {
      LABEL: "Infrastructure",
      RTO: {
        LABEL: "RTO",
        NAME: "infrastructure_rto",
        PLACEHOLDER: 0,
        UNIT_NAME: "infrastructure_rto_unit",
        ERROR: "Infrastructure RTO is required",
      },
      RPO: {
        LABEL: "RPO",
        NAME: "infrastructure_rpo",
        PLACEHOLDER: 0,
        UNIT_NAME: "infrastructure_rpo_unit",
        ERROR: "Infrastructure RPO is required",
      },
    },
    RESILIENCY_POLICY_APPLICATION: {
      LABEL: "Application",
      RTO: {
        LABEL: "RTO",
        NAME: "application_rto",
        PLACEHOLDER: 0,
        UNIT_NAME: "application_rto_unit",
        ERROR: "Application RTO is required",
      },
      RPO: {
        LABEL: "RPO",
        NAME: "application_rpo",
        PLACEHOLDER: 0,
        UNIT_NAME: "application_rpo_unit",
        ERROR: "Application RPO is required",
      },
    },
    RESILIENCY_POLICY_AZ: {
      LABEL: "Available Zones",
      RTO: {
        LABEL: "RTO",
        NAME: "az_rto",
        PLACEHOLDER: 0,
        UNIT_NAME: "az_rto_unit",
        ERROR: "AZ RTO is required",
      },
      RPO: {
        LABEL: "RPO",
        NAME: "az_rpo",
        PLACEHOLDER: 0,
        UNIT_NAME: "az_rpo_unit",
        ERROR: "AZ RPO is required",
      },
    },
  };

export const basicDetailsApplicationConstants: BasicDetailsConstants = {
  TITLE: "Basic Details",
  APPLICATION_NAME: {
    NAME: "application_name",
    LABEL: "Application name",
    TYPE: "text",
    PLACEHOLDER: "[Application_Name]",
    ERROR: "[Application_Name] is required",
    AVAILABILITY_ERROR: "[Application_Name] is not available",
  },
  APPLICATION_DESCRIPTION: {
    NAME: "application_description",
    LABEL: "Description",
    TYPE: "text",
    PLACEHOLDER: "Type here",
    ERROR: "[Project_Description] is required",
  },
  PRIMARY_TAGS: {
    NAME: "primary_tag",
    LABEL: "Primary",
  },
  SECONDARY_TAGS: {
    NAME: "secondary_tag",
    LABEL: "Secondary",
  },
  PRIVACY: {
    NAME: "privacy",
    LABEL: "Privacy",
    TYPE: "text",
    ERROR: "[Project_Description] is required",
  },
};

export const ConfigureResourceGroupConstants: ConfigureResourceFormFieldConstantType =
  {
    NAME: {
      NAME: "name",
      LABEL: "Name",
      PLACEHOLDER: "Name",
      TYPE: "text",
      ERROR: "Name is required",
    },

    DESCRIPTION: {
      NAME: "description",
      LABEL: "Description",
      PLACEHOLDER: "Name",
      ERROR: "Description is required",
      TYPE: "text",
    },

    TAGS: {
      NAME: "tags",
      LABEL: "AWS Resource Tags",
    },
  };

export const ConfigureRepositoriesConstants: ConfigureRepositoryConstantType = {
  NAME: {
    NAME: "name",
    LABEL: "Name",
    TYPE: "text",
    PLACEHOLDER: "Name",
    ERROR: "Name is required",
  },
  BRANCH_NAME: {
    NAME: "branch_name",
    LABEL: "Branch Name",
    TYPE: "text",
    PLACEHOLDER: "Branch Name",
    ERROR: "Branch Name is required",
  },
  REPO_USERNAME: {
    NAME: "repo_username",
    LABEL: "Repo Username",
    TYPE: "text",
    PLACEHOLDER: "Repo Username",
    ERROR: "Repo Username is required",
  },
  REPOSITORY_NAME: {
    NAME: "repository_name",
    LABEL: "Repository Name",
    TYPE: "text",
    PLACEHOLDER: "Repository Name",
    ERROR: "Repository Name is required",
  },
  CLI_TOKEN: {
    NAME: "cli_token",
    LABEL: "CLI Token",
    TYPE: "text",
    PLACEHOLDER: "CLI Token",
    ERROR: "CLI Token is required",
  },

  REPOSITORY_URL: {
    NAME: "repository_url",
    LABEL: "Enter Repository URL",
    TYPE: "text",
    PLACEHOLDER: "Repository Url",
    ERROR: "Repository Url is required",
  },

  AWS_ACCOUNT: {
    NAME: "aws_account",
    LABEL: "Select AWS Account",
    TYPE: "text",
    PLACEHOLDER: "Select ",
    ERROR: "AWS Accoutn is required",
  },

  GITHUB_ACCOUNT: {
    NAME: "github_account",
    LABEL: "Select GitHub Account",
    TYPE: "string",
    PLACEHOLDER: "Select",
    ERROR: "Github Account is required",
  },
};