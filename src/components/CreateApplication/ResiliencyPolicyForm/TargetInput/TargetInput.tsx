import { Collapse, Flex, Form, InputNumber, Select } from "antd";

import { Text } from "components";

import { Metrics } from "themes";

import "./targetInput.styles.scss";

interface TargetInputFormType {
  LABEL: string;
  RTO: {
    LABEL: string;
    NAME: string;
    UNIT_NAME: string;
    PLACEHOLDER: number;
    ERROR: string;
  };
  RPO: {
    LABEL: string;
    NAME: string;
    UNIT_NAME: string;
    PLACEHOLDER: number;
    ERROR: string;
  };
}

const targetUnitOptions = [
  { label: "seconds", value: "seconds" },
  { label: "minutes", value: "minutes" },
  { label: "hours", value: "hours" },
];

interface TargetInputProps {
  formType: TargetInputFormType;
  advanced: boolean;
}

const TargetInput: React.FC<TargetInputProps> = ({ formType, advanced }) => {
  return (
    <Collapse
      items={[
        {
          key: "1",
          label: <Text text={formType.LABEL} weight="semibold" />,
          showArrow: false,
          children: (
            <Flex
              vertical
              gap={Metrics.SPACE_MD}
              className="target-input-wrapper"
            >
              <Flex
                vertical
                gap={Metrics.SPACE_XS}
                className="target-input-container"
              >
                <Text text="RTO" weight="semibold" />
                <Flex gap={Metrics.SPACE_XS}>
                  <Form.Item
                    name={formType.RTO.NAME}
                    rules={[
                      { required: advanced, message: formType.RTO.ERROR },
                    ]}
                    className="target-input-form"
                  >
                    <InputNumber
                      min={0}
                      precision={0}
                      placeholder={formType.RTO.PLACEHOLDER.toString()}
                      className="target-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name={formType.RTO.UNIT_NAME}
                    rules={[
                      { required: advanced, message: formType.RTO.ERROR },
                    ]}
                    initialValue={"hours"}
                    className="target-input-form"
                  >
                    <Select options={targetUnitOptions} />
                  </Form.Item>
                </Flex>
              </Flex>

              <Flex
                vertical
                gap={Metrics.SPACE_XS}
                className="target-input-container"
              >
                <Text text="RPO" weight="semibold" />
                <Flex gap={Metrics.SPACE_XS}>
                  <Form.Item
                    name={formType.RPO.NAME}
                    rules={[
                      { required: advanced, message: formType.RPO.ERROR },
                    ]}
                    className="target-input-form"
                  >
                    <InputNumber
                      min={0}
                      precision={0}
                      placeholder={formType.RPO.PLACEHOLDER.toString()}
                      className="target-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name={formType.RPO.UNIT_NAME}
                    rules={[
                      { required: advanced, message: formType.RPO.ERROR },
                    ]}
                    initialValue={"hours"}
                    className="target-input-form"
                  >
                    <Select options={targetUnitOptions} />
                  </Form.Item>
                </Flex>
              </Flex>
            </Flex>
          ),
        },
      ]}
      ghost
      defaultActiveKey={["1"]}
      expandIconPosition="end"
      className="target-input-collapse"
    />
  );
};

export default TargetInput;
