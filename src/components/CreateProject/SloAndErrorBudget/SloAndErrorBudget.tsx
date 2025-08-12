import { useEffect } from "react";

import { Flex, Form, Radio, Select } from "antd";
import { SloAndErrorBudgetConstants } from "constant";
import { SLOAndErrorBudgetFormField } from "interfaces";

import { Text } from "components";

import { useCreateProject } from "context";

import { Metrics } from "themes";

import "./sloAndErrorBudget.style.scss";

interface SloAndErrorBudgetProps {
  setDisabledNext: (value: boolean) => void;
  setShowSkipBtn: (value: boolean) => void;
}

const SloAndErrorBudget: React.FC<SloAndErrorBudgetProps> = ({
  setDisabledNext,
  setShowSkipBtn,
}) => {
  const { ACCOUNT } = SloAndErrorBudgetConstants;
  const { sloAndErrorBudgetForm } = useCreateProject();

  useEffect(() => {
    setShowSkipBtn(true);
  }, [setShowSkipBtn]);

  const handleFormChange = () => {
    const hasErrors =
      sloAndErrorBudgetForm
        ?.getFieldsError()
        .filter(({ errors }) => errors.length).length > 0;

    setDisabledNext(hasErrors);
    setShowSkipBtn(!hasErrors);
  };

  return (
    <Flex vertical gap={Metrics.SPACE_MD}>
      <Radio.Group value={1}>
        <Flex align="center" gap={Metrics.SPACE_SM}>
          <Radio value={1} className="account-selector-radiobtn">
            Nobl9
          </Radio>
          <Radio
            value={2}
            className="account-selector-radiobtn accountRadiobtn-disabled"
            disabled
          >
            AWS
          </Radio>
        </Flex>
      </Radio.Group>
      <Form
        layout="vertical"
        form={sloAndErrorBudgetForm}
        onFieldsChange={handleFormChange}
      >
        <Form.Item<SLOAndErrorBudgetFormField>
          name={ACCOUNT.NAME}
          label={<Text text={ACCOUNT.LABEL} weight="semibold" />}
          rules={[
            {
              required: true,
              message: ACCOUNT.ERROR,
            },
          ]}
        >
          <Select options={[]} placeholder={ACCOUNT.PLACEHOLDER} />
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default SloAndErrorBudget;
