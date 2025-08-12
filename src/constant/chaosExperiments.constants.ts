import { ConfigureExperimentFormFields } from "interfaces";


export const configureExperimentFormConstants: ConfigureExperimentFormFields = {
  EXPERIMENT_NAME: {
    NAME: "experiment_name",
    LABEL: "Name",
    TYPE: "text",
    PLACEHOLDER: "Enter Experiment Name",
    ERROR: "Experiment name is required",
  },

  SCENARIO_NAME: {
    NAME: "scenario_name",
    LABEL: "Test Scenario",
    TYPE: "text",
    PLACEHOLDER: "Enter Scenario Name",
    ERROR: "Scenario name is required",
  },

  AGENT: {
    NAME: "agent",
    LABEL: "Agents",
    TYPE: "text",
    PLACEHOLDER: "Enter Scenario Name",
    ERROR: "Scenario name is required",
  },

  HEALTH_CHECK: {
    NAME: "health_check",
    LABEL: "Health Checks",
    TYPE: "text",
    PLACEHOLDER: "Enter Scenario Name",
    ERROR: "Scenario name is required",
  }
};