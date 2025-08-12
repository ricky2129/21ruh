import { Form, FormInstance } from "antd";
import { Flex } from "antd";
import { Input, Text } from "components";
import { Metrics } from "themes";

const FIELD_KEYS = [
  "URL",
  "EMAIL",
  "API_TOKEN",
  "GROQ_API_KEY",
  "PROJECT_KEY",
  "DONE_TRANSITION_ID",
] as const;

type FieldKey = typeof FIELD_KEYS[number];

interface ConfigureToilAssistFormField {
  URL: string;
  EMAIL: string;
  API_TOKEN: string;
  GROQ_API_KEY: string;
  PROJECT_KEY: string;
  DONE_TRANSITION_ID: string;
}

const FIELD_CONSTANTS: Record<
  FieldKey,
  {
    LABEL: string;
    PLACEHOLDER: string;
    ERROR: string;
    TYPE: "text" | "email" | "password" | "number";
  }
> = {
  URL: {
    LABEL: "Jira URL",
    PLACEHOLDER: "Enter the instance URL",
    ERROR: "URL is required",
    TYPE: "text",
  },
  EMAIL: {
    LABEL: "Jira Email",
    PLACEHOLDER: "Enter your Jira email",
    ERROR: "Email is required",
    TYPE: "email",
  },
  API_TOKEN: {
    LABEL: "Jira API Token",
    PLACEHOLDER: "Enter your Jira API token",
    ERROR: "API token is required",
    TYPE: "password",
  },
  GROQ_API_KEY: {
    LABEL: "GROQ API Key",
    PLACEHOLDER: "Enter your GROQ API key",
    ERROR: "GROQ API key is required",
    TYPE: "password",
  },
  PROJECT_KEY: {
    LABEL: "Jira Project Key",
    PLACEHOLDER: "Enter the Jira project key",
    ERROR: "Project key is required",
    TYPE: "text",
  },
  DONE_TRANSITION_ID: {
    LABEL: "Jira Done Transition ID",
    PLACEHOLDER: "Enter the Done transition ID",
    ERROR: "Done transition ID is required",
    TYPE: "text",
  },
};

interface ConfigureToilAssistProps {
  configureToilAssistForm: FormInstance<ConfigureToilAssistFormField>;
  setDisabledSave: (boolean) => void;
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

const ConfigureToilAssist: React.FC<ConfigureToilAssistProps> = ({
  configureToilAssistForm,
  setDisabledSave,
}) => {
  const handleFormChange = () => {
    const hasErrors =
      configureToilAssistForm
        ?.getFieldsError()
        .filter(({ errors }) => errors.length).length > 0;
    setDisabledSave(hasErrors);
  };

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      <Form
        form={configureToilAssistForm}
        layout="vertical"
        onFieldsChange={handleFormChange}
      >
        {FIELD_KEYS.map((key) => (
          <Form.Item<ConfigureToilAssistFormField>
            key={key}
            label={<Text text={FIELD_CONSTANTS[key].LABEL} weight="semibold" />}
            name={key}
            rules={[
              {
                required: true,
                message: FIELD_CONSTANTS[key].ERROR,
              },
              ...(key === "URL"
                ? [
                    {
                      validator: urlValidator,
                    },
                  ]
                : []),
            ]}
          >
            <Input
              placeholder={FIELD_CONSTANTS[key].PLACEHOLDER}
              type={FIELD_CONSTANTS[key].TYPE}
              autoComplete="off"
            />
          </Form.Item>
        ))}
      </Form>
    </Flex>
  );
};

export default ConfigureToilAssist;
