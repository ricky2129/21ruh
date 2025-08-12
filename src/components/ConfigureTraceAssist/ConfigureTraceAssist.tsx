import React, { useEffect } from "react";
import { Form, FormInstance, Radio, Button, message, Flex } from "antd";
import { Input, Text } from "components";
import { Metrics } from "themes";
import { useCreateDeployment } from "react-query/traceAssistQueries";

const FIELD_KEYS = [
  "GITHUB_REPO_URL",
  "GITHUB_AUTH_TOKEN",
  "MONITORING_TOOL",
  "DEPLOYMENT_NAME",
] as const;

type FieldKey = typeof FIELD_KEYS[number];

interface ConfigureTraceAssistFormField {
  GITHUB_REPO_URL: string;
  GITHUB_AUTH_TOKEN?: string;
  MONITORING_TOOL: string;
  DEPLOYMENT_NAME: string;
}

const FIELD_CONSTANTS: Record<
  FieldKey,
  {
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE?: "text" | "password";
  }
> = {
  GITHUB_REPO_URL: {
    LABEL: "GitHub Repo URL",
    PLACEHOLDER: "Enter the GitHub repository URL",
    ERROR: "Repository URL is required",
    TYPE: "text",
  },
  GITHUB_AUTH_TOKEN: {
    LABEL: "GitHub Auth Token",
    PLACEHOLDER: "Enter your GitHub Auth Token (optional)",
    ERROR: "",
    TYPE: "password",
  },
  MONITORING_TOOL: {
    LABEL: "Monitoring Tools",
    PLACEHOLDER: "",
    ERROR: "Monitoring tool is required",
  },
  DEPLOYMENT_NAME: {
    LABEL: "Custom Deployment Name",
    PLACEHOLDER: "Enter a deployment name",
    ERROR: "Deployment name is required",
    TYPE: "text",
  },
};

const MONITORING_TOOLS = [
  { label: "OpenTelemetry", value: "opentelemetry", disabled: false },
  { label: "Jaeger", value: "jaeger", disabled: true },
  { label: "Zipkin", value: "zipkin", disabled: true },
  { label: "Datadog", value: "datadog", disabled: true },
];

interface ConfigureTraceAssistProps {
  configureTraceAssistForm: FormInstance<ConfigureTraceAssistFormField>;
  setDisabledSave: (disabled: boolean) => void;
  onSuccess?: () => void;
}

const urlValidator = (_: any, value: string) => {
  if (!value) return Promise.resolve();
  try {
    new URL(value);
    return Promise.resolve();
  } catch {
    return Promise.reject("Please enter a valid URL");
  }
};

const ConfigureTraceAssist: React.FC<ConfigureTraceAssistProps> = ({
  configureTraceAssistForm,
  setDisabledSave,
  onSuccess,
}) => {
  const { mutateAsync, isLoading } = useCreateDeployment();

  useEffect(() => {
    if (!configureTraceAssistForm.getFieldValue("MONITORING_TOOL")) {
      configureTraceAssistForm.setFieldsValue({ MONITORING_TOOL: "opentelemetry" });
    }
    handleFormChange();
  }, []);

  const handleFormChange = () => {
    const hasErrors =
      configureTraceAssistForm
        ?.getFieldsError()
        .filter(({ errors }) => errors.length).length > 0;
    setDisabledSave(hasErrors);
  };

  const handleSubmit = async () => {
    try {
      const values = await configureTraceAssistForm.validateFields();
      const payload = {
        repo_url: values.GITHUB_REPO_URL,
        deployment_name: values.DEPLOYMENT_NAME,
        pat_token: values.GITHUB_AUTH_TOKEN,
      };
      await mutateAsync(payload);
      message.success("Deployment created successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      }
    }
  };

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      <Form
        form={configureTraceAssistForm}
        layout="vertical"
        onFieldsChange={handleFormChange}
        onFinish={handleSubmit}
        initialValues={{ MONITORING_TOOL: "opentelemetry" }}
      >
        <Form.Item<ConfigureTraceAssistFormField>
          key="DEPLOYMENT_NAME"
          label={
            <Text
              text={FIELD_CONSTANTS.DEPLOYMENT_NAME.LABEL}
              weight="semibold"
            />
          }
          name="DEPLOYMENT_NAME"
          rules={[
            { required: true, message: FIELD_CONSTANTS.DEPLOYMENT_NAME.ERROR },
          ]}
        >
          <Input
            placeholder={FIELD_CONSTANTS.DEPLOYMENT_NAME.PLACEHOLDER}
            type={FIELD_CONSTANTS.DEPLOYMENT_NAME.TYPE}
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item<ConfigureTraceAssistFormField>
          key="GITHUB_REPO_URL"
          label={
            <Text
              text={FIELD_CONSTANTS.GITHUB_REPO_URL.LABEL}
              weight="semibold"
            />
          }
          name="GITHUB_REPO_URL"
          rules={[
            { required: true, message: FIELD_CONSTANTS.GITHUB_REPO_URL.ERROR },
            { validator: urlValidator },
          ]}
        >
          <Input
            placeholder={FIELD_CONSTANTS.GITHUB_REPO_URL.PLACEHOLDER}
            type={FIELD_CONSTANTS.GITHUB_REPO_URL.TYPE}
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item<ConfigureTraceAssistFormField>
          key="GITHUB_AUTH_TOKEN"
          label={
            <Text
              text={FIELD_CONSTANTS.GITHUB_AUTH_TOKEN.LABEL}
              weight="semibold"
            />
          }
          name="GITHUB_AUTH_TOKEN"
        >
          <Input
            placeholder={FIELD_CONSTANTS.GITHUB_AUTH_TOKEN.PLACEHOLDER}
            type={FIELD_CONSTANTS.GITHUB_AUTH_TOKEN.TYPE}
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item<ConfigureTraceAssistFormField>
          key="MONITORING_TOOL"
          label={
            <Text
              text={FIELD_CONSTANTS.MONITORING_TOOL.LABEL}
              weight="semibold"
            />
          }
          name="MONITORING_TOOL"
          rules={[
            { required: true, message: FIELD_CONSTANTS.MONITORING_TOOL.ERROR },
          ]}
        >
          <Radio.Group style={{ width: "100%" }}>
            <Flex vertical gap={Metrics.SPACE_SM}>
              {MONITORING_TOOLS.map((tool) => (
                <Radio
                  key={tool.value}
                  value={tool.value}
                  disabled={tool.disabled}
                >
                  {tool.label}
                </Radio>
              ))}
            </Flex>
          </Radio.Group>
        </Form.Item>

        <div style={{ marginTop: 8, color: "#888" }}>
          <Text text="By default, using 'Main' branch." type="footnote" />
        </div>

        <Form.Item>
          <Flex justify="end">
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ marginTop: 16 }}
            >
              Create Deployment
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default ConfigureTraceAssist;
