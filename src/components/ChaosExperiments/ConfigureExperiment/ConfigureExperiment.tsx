import { useGetActiveHealthChecks, useGetScenarioLists } from "react-query";

import { Form, FormInstance, Select } from "antd";
import { configureExperimentFormConstants } from "constant";
import { ConfigureExperimentFormFieldType } from "interfaces";

import { Input, Text } from "components";

import { useAppNavigation } from "context";

interface option {
  label: string;
  value: string | number;
}

interface ConfigureExperimentProps {
  configureExperimentForm: FormInstance<ConfigureExperimentFormFieldType>;
  chaosAgents: option[];
  setDisabledSave: (boolean) => void;
}

const ConfigureExperiment: React.FC<ConfigureExperimentProps> = ({
  configureExperimentForm,
  chaosAgents,
  setDisabledSave,
}) => {
  const { EXPERIMENT_NAME, SCENARIO_NAME, AGENT, HEALTH_CHECK } =
    configureExperimentFormConstants;

  const { application } = useAppNavigation();

  const service_id = application?.services?.find(
    (service) => service.service === "Experiments",
  ).id;

  const scenarioListQuery = useGetScenarioLists();
  const getHealthChecks = useGetActiveHealthChecks(service_id?.toString());

  const scenarioOptions = scenarioListQuery.data?.map((scenario) => ({
    label: scenario
      ?.split("-")
      ?.map((name) => name.charAt(0).toUpperCase() + name.slice(1))
      ?.join(" "),
    value: scenario,
  }));

  /**
   * Handles form field changes and checks for form errors.
   * If the form has errors, sets the disabledSave state to true.
   * Otherwise, sets it to false.
   */
  const handleFormChange = () => {
    const hasErrors =
      configureExperimentForm
        ?.getFieldsError()
        .filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  return (
    <Form
      form={configureExperimentForm}
      onFieldsChange={handleFormChange}
      layout="vertical"
    >
      <Form.Item<ConfigureExperimentFormFieldType>
        label={<Text text={EXPERIMENT_NAME.LABEL} weight="semibold" />}
        name={EXPERIMENT_NAME.NAME}
        rules={[
          {
            required: true,
            message: EXPERIMENT_NAME.ERROR,
          },
        ]}
      >
        <Input
          placeholder={EXPERIMENT_NAME.PLACEHOLDER}
          type={EXPERIMENT_NAME.TYPE}
        />
      </Form.Item>
      <Form.Item<ConfigureExperimentFormFieldType>
        name={SCENARIO_NAME.NAME}
        label={<Text text={SCENARIO_NAME.LABEL} weight="semibold" />}
        rules={[
          {
            required: true,
            message: SCENARIO_NAME.ERROR,
          },
        ]}
      >
        <Select
          options={scenarioOptions}
          loading={scenarioListQuery?.isLoading}
          disabled={scenarioListQuery?.isLoading}
        />
      </Form.Item>
      <Form.Item<ConfigureExperimentFormFieldType>
        name={AGENT.NAME}
        label={<Text text={AGENT.LABEL} weight="semibold" />}
        rules={[
          {
            required: true,
            message: AGENT.ERROR,
          },
        ]}
      >
        <Select options={chaosAgents} />
      </Form.Item>
      <Form.Item<ConfigureExperimentFormFieldType>
        name={HEALTH_CHECK.NAME}
        label={<Text text={HEALTH_CHECK.LABEL} weight="semibold" />}
      >
        <Select
          options={getHealthChecks?.data?.map((value) => {
            return {
              label: value?.["health-check-name"],
              value: value?.identifier,
            };
          })}
          loading={getHealthChecks?.isLoading}
          disabled={getHealthChecks?.isLoading}
        />
      </Form.Item>
    </Form>
  );
};

export default ConfigureExperiment;
