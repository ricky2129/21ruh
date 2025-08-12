import { SloAndErrorBudgetConstantType } from "interfaces";

interface BasicDetailsConstants {
  TITLE: string;
  PROJECT_NAME: {
    NAME: "project_name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
    CHECK_PROJECT_NAME_ERROR: string;
  };
  PROJECT_DESCRIPTION: {
    NAME: "project_description";
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
    ERROR: string;
  };
}

interface UserGrantAccessForm {
  USER_NAME: {
    NAME: "user_name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };
  USER_EMAIL: {
    NAME: "email";
    LABEL: string;
    TYPE: string;
  };
  USER_ROLE: {
    NAME: "role_id";
    LABEL: string;
    TYPE: string;
    ERROR: string;
  };
}

export const emptyProjectConstants = {
  TITLE: "You have not created any portfolio yet.",
  SUBTITLE:
    "Please click below “Create New Portfolio” button to get stated with.",
};

export const basicDetailsConstants: BasicDetailsConstants = {
  TITLE: "Basic Details",
  PROJECT_NAME: {
    NAME: "project_name",
    LABEL: "Portfolio name",
    TYPE: "text",
    PLACEHOLDER: "[Portfolio_Name]",
    ERROR: "[Portfolio_Name] is required",
    CHECK_PROJECT_NAME_ERROR: "[Portfolio_Name] not available",
  },
  PROJECT_DESCRIPTION: {
    NAME: "project_description",
    LABEL: "Description",
    TYPE: "text",
    PLACEHOLDER: "Type here",
    ERROR: "[Project_Description] not available",
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
    ERROR: "Primary is required",
  },
};

interface NotificationFormType {
  NOTIFICATION_NAME: {
    NAME: "name";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };
  EMAIL_ADDRESS: {
    NAME: "recipients";
    LABEL: string;
    TYPE: string;
    PLACEHOLDER: string;
    ERROR: string;
    INVALID_EMAIL_ERROR: string;
  };
  TRIGGERS: {
    NAME: "trigger";
    LABEL: string;
    TYPE: string;
    ERROR: string;
  };
}

export interface SLOFormConstants {
  SLO_NAME: {
    NAME: "name";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
  };
  KPI: {
    NAME: "kpi_id";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    LIST: {
      NAME: string;
      VALUE: number;
      UNIT: string;
    }[];
  };
  TARGET: {
    NAME: "target_value";
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    CRITERIA: {
      NAME: "target_criteria";
      LIST: {
        LABEL: string;
        SYMBOL: string;
      }[];
    };
  };
  APPLICATION_TAGS: {
    NAME: "application_tags";
    LABEL: string;
    ERROR: string;
  };
}

export const sloFormConstants: SLOFormConstants = {
  SLO_NAME: {
    NAME: "name",
    LABEL: "SLO Name",
    PLACEHOLDER: "Enter a SLO name",
    ERROR: "SLO Name is required",
  },
  KPI: {
    NAME: "kpi_id",
    LABEL: "KPI",
    PLACEHOLDER: "Select",
    ERROR: "KPI is required",
    LIST: [
      { NAME: "SRS", VALUE: 0, UNIT: "Min" },
      { NAME: "Risk Exposure", VALUE: 1, UNIT: "%" },
      { NAME: "SOPs coverage", VALUE: 2, UNIT: "Level" },
      { NAME: "SLO Adherence", VALUE: 3, UNIT: "%" },
      { NAME: "Remediation Efficiency", VALUE: 4, UNIT: "Min" },
    ],
  },
  TARGET: {
    NAME: "target_value",
    LABEL: "Target",
    PLACEHOLDER: "Type here",
    ERROR: "Target is required",
    CRITERIA: {
      NAME: "target_criteria",
      LIST: [
        {
          LABEL: "Geater than",
          SYMBOL: ">",
        },
        {
          LABEL: "Greater than or equal to",
          SYMBOL: ">=",
        },
        {
          LABEL: "Less than",
          SYMBOL: "<",
        },
        {
          LABEL: "Less than or equal to",
          SYMBOL: "<=",
        },
        {
          LABEL: "Equal to",
          SYMBOL: "=",
        },
        {
          LABEL: "Not equal to",
          SYMBOL: "!=",
        },
      ],
    },
  },
  APPLICATION_TAGS: {
    NAME: "application_tags",
    LABEL: "Applications Tags",
    ERROR: "Application Tag is required",
  },
};

export const userGrantAccessForm: UserGrantAccessForm = {
  USER_NAME: {
    NAME: "user_name",
    LABEL: "User Name",
    TYPE: "text",
    PLACEHOLDER: "Enter Name",
    ERROR: "Username is required",
  },
  USER_EMAIL: {
    NAME: "email",
    LABEL: "Email Address",
    TYPE: "text",
  },
  USER_ROLE: {
    NAME: "role_id",
    LABEL: "Role",
    TYPE: "text",
    ERROR: "Userole is required",
  },
};

export const notificationForm: NotificationFormType = {
  NOTIFICATION_NAME: {
    NAME: "name",
    LABEL: "Notification Name",
    TYPE: "text",
    PLACEHOLDER: "Enter Notification Name",
    ERROR: "Name is required",
  },
  EMAIL_ADDRESS: {
    NAME: "recipients",
    LABEL: "Addresses",
    TYPE: "text",
    PLACEHOLDER: "Enter Email Address",
    ERROR: "Addresses is required",
    INVALID_EMAIL_ERROR: "Email Address should be valid",
  },
  TRIGGERS: {
    NAME: "trigger",
    LABEL: "Triggers",
    TYPE: "text",
    ERROR: "triggers is required",
  },
};

export const SloAndErrorBudgetConstants: SloAndErrorBudgetConstantType = {
  ACCOUNT: {
    NAME: "account",
    LABEL: "Select Account",
    TYPE: "text",
    PLACEHOLDER: "Select",
    ERROR: "Account required"
  }
};
