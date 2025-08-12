interface TeamGrantAccessForm {
  TEAM_ID: {
    NAME: "team_id";
    LABEL: string;
    TYPE: "text";
    PLACEHOLDER: string;
    ERROR: string;
  };
  TEAM_ROLE: {
    NAME: "role_id";
    LABEL: string;
    TYPE: string;
    ERROR: string;
  };
  TEAM_MEMBERS: {
    NAME: "team_members";
    LABEL: string;
    TYPE: string[];
    ERROR: string;
  };
}

export const teamGrantAccessForm: TeamGrantAccessForm = {
  TEAM_ID: {
    NAME: "team_id",
    LABEL: "Team Name",
    TYPE: "text",
    PLACEHOLDER: "Enter Name",
    ERROR: "TeamName is required",
  },

  TEAM_ROLE: {
    NAME: "role_id",
    LABEL: "Role",
    TYPE: "text",
    ERROR: "team role is required",
  },

  TEAM_MEMBERS: {
    NAME: "team_members",
    LABEL: "Team Members",
    TYPE: [],
    ERROR: "",
  },
};
