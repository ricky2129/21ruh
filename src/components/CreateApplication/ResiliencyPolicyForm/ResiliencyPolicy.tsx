import {
  Collapse,
  Flex,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
} from "antd";
import { useWatch } from "antd/es/form/Form";
import { createResiliencyPolicyFormConstants } from "constant";
import { CreateResilienctPolicyFormFields } from "interfaces";

import { Text } from "components";

import { Colors, Metrics } from "themes";

import { TargetInput } from "./TargetInput";

interface ResiliencyPolicyProps {
  setDisabledSave: (disabledSave: boolean) => void;
  resiliencyPolicyForm: FormInstance<CreateResilienctPolicyFormFields>;
}

const targetUnitOptions = [
  { label: "seconds", value: "seconds" },
  { label: "minutes", value: "minutes" },
  { label: "hours", value: "hours" },
];

const ResiliencyPolicy: React.FC<ResiliencyPolicyProps> = ({
  setDisabledSave,
  resiliencyPolicyForm,
}) => {
  const {
    RESILIENCY_POLICY,
    RESILIENCY_POLICY_INFRASTRUCTURE,
    RESILIENCY_POLICY_APPLICATION,
    RESILIENCY_POLICY_AZ,
  } = createResiliencyPolicyFormConstants;

  const advancedFields = useWatch(RESILIENCY_POLICY.ADVANCED, {
    form: resiliencyPolicyForm,
    preserve: true,
  });

  const handleFormChange = () => {
    const hasErrors =
      resiliencyPolicyForm
        ?.getFieldsError()
        .filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  return (
    <Flex
      gap={Metrics.SPACE_MD}
      vertical
      className="create-resiliency-policy-container"
    >
      <Form
        layout="vertical"
        form={resiliencyPolicyForm}
        initialValues={{
          advanced: false,
        }}
        onFieldsChange={handleFormChange}
      >
        <Form.Item
          name={RESILIENCY_POLICY.NAME.NAME}
          label={<Text text={RESILIENCY_POLICY.NAME.LABEL} weight="semibold" />}
          rules={[
            {
              required: true,
              message: RESILIENCY_POLICY.NAME.ERROR,
            },
          ]}
        >
          <Input placeholder={RESILIENCY_POLICY.NAME.PLACEHOLDER} />
        </Form.Item>

        <Flex vertical gap={Metrics.SPACE_MD} className="target-input-wrapper">
          <Flex vertical>
            <Text
              text={RESILIENCY_POLICY.TARGET.LABEL}
              type="cardtitle"
              weight="semibold"
            />
            <Text text={RESILIENCY_POLICY.TARGET.SUBLABEL} type="footnote" />
          </Flex>

          <Flex
            vertical
            gap={Metrics.SPACE_XS}
            className="target-input-container"
          >
            <Text text="RTO" weight="semibold" />
            <Flex gap={Metrics.SPACE_XS}>
              <Form.Item
                name={RESILIENCY_POLICY.RTO.NAME}
                rules={[
                  {
                    required: !advancedFields,
                    message: RESILIENCY_POLICY.RTO.ERROR,
                  },
                ]}
                className="target-input-form"
              >
                <InputNumber
                  min={0}
                  precision={0}
                  placeholder={RESILIENCY_POLICY.RTO.PLACEHOLDER.toString()}
                  className="target-input"
                  disabled={advancedFields}
                />
              </Form.Item>

              <Form.Item
                name={RESILIENCY_POLICY.RTO.UNIT_NAME}
                rules={[
                  {
                    required: true,
                    message: RESILIENCY_POLICY.RTO.ERROR,
                  },
                ]}
                initialValue={"hours"}
                className="target-input-form"
              >
                <Select options={targetUnitOptions} disabled={advancedFields} />
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
                name={RESILIENCY_POLICY.RPO.NAME}
                rules={[
                  {
                    required: !advancedFields,
                    message: RESILIENCY_POLICY.RPO.ERROR,
                  },
                ]}
                className="target-input-form"
              >
                <InputNumber
                  min={0}
                  precision={0}
                  placeholder={RESILIENCY_POLICY.RPO.PLACEHOLDER.toString()}
                  className="target-input"
                  disabled={advancedFields}
                />
              </Form.Item>

              <Form.Item
                name={RESILIENCY_POLICY.RPO.UNIT_NAME}
                rules={[
                  {
                    required: !advancedFields,
                    message: RESILIENCY_POLICY.RPO.ERROR,
                  },
                ]}
                initialValue={"hours"}
                className="target-input-form"
              >
                <Select options={targetUnitOptions} disabled={advancedFields} />
              </Form.Item>
            </Flex>
          </Flex>
        </Flex>

        <Collapse
          items={[
            {
              key: "1",
              label: (
                <Text
                  text={"Advanced"}
                  weight="semibold"
                  color={Colors.PRIMARY_BLUE}
                />
              ),
              children: (
                <Flex vertical gap={Metrics.SPACE_MD}>
                  <TargetInput
                    formType={RESILIENCY_POLICY_INFRASTRUCTURE}
                    advanced={advancedFields}
                  />
                  <TargetInput
                    formType={RESILIENCY_POLICY_APPLICATION}
                    advanced={advancedFields}
                  />
                  <TargetInput
                    formType={RESILIENCY_POLICY_AZ}
                    advanced={advancedFields}
                  />
                </Flex>
              ),
            },
          ]}
          onChange={(key) => {
            resiliencyPolicyForm.setFieldValue(
              RESILIENCY_POLICY.ADVANCED,
              !!key.length,
            );

            resiliencyPolicyForm.validateFields([
              RESILIENCY_POLICY.ADVANCED,
              RESILIENCY_POLICY_INFRASTRUCTURE.RTO.NAME,
              RESILIENCY_POLICY_INFRASTRUCTURE.RPO.NAME,
              RESILIENCY_POLICY_APPLICATION.RPO.NAME,
              RESILIENCY_POLICY_APPLICATION.RTO.NAME,
              RESILIENCY_POLICY_AZ.RPO.NAME,
              RESILIENCY_POLICY_AZ.RTO.NAME,
            ]);

            resiliencyPolicyForm.resetFields([
              RESILIENCY_POLICY_INFRASTRUCTURE.RTO.NAME,
              RESILIENCY_POLICY_INFRASTRUCTURE.RPO.NAME,
              RESILIENCY_POLICY_APPLICATION.RPO.NAME,
              RESILIENCY_POLICY_APPLICATION.RTO.NAME,
              RESILIENCY_POLICY_AZ.RPO.NAME,
              RESILIENCY_POLICY_AZ.RTO.NAME,
            ]);
          }}
          ghost
          expandIconPosition="end"
        />
      </Form>
    </Flex>
  );
};

export default ResiliencyPolicy;
