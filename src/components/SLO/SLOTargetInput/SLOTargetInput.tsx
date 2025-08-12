import { Flex, Form, FormInstance, Input, Select, Space } from "antd";
import { sloFormConstants } from "constant";
import { SLOFormType } from "interfaces";

import { ArrowDownIcon } from "assets";

import { IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./sloTargetInput.styles.scss";

interface SLOTargetInputProps {
  target: number;
  form: FormInstance<SLOFormType>;
}

const SLOTargetInput: React.FC<SLOTargetInputProps> = ({ target, form }) => {
  const { TARGET } = sloFormConstants;
  const criteria = Form.useWatch(TARGET.CRITERIA.NAME, {
    form: form,
    preserve: false,
  });

  switch (target) {
    case 0:
    case 4:
      return <Flex>{"Minutes"}</Flex>;

    case 1:
    case 3:
      return (
        <Form.Item
          label={<Text text={TARGET.LABEL} weight="semibold" />}
          name={TARGET.NAME}
          rules={[
            {
              required: true,
              message: TARGET.ERROR,
            },
          ]}
        >
          <Input
            prefix={
              <Flex
                align="center"
                justify="center"
                className="slo-target-criteria-symbol"
              >
                <Text
                  text={criteria}
                  type="footnote"
                  weight="semibold"
                  color={Colors.COOL_GRAY_6}
                />
              </Flex>
            }
            addonBefore={
              <Form.Item<SLOFormType>
                name={TARGET.CRITERIA.NAME}
                initialValue={TARGET.CRITERIA.LIST[1].SYMBOL}
                rules={[{ required: true }]}
                className="slo-target-criteria"
              >
                <Select
                  options={TARGET.CRITERIA.LIST.map((criteria) => ({
                    label: criteria.LABEL,
                    value: criteria.SYMBOL,
                  }))}
                  suffixIcon={
                    <IconViewer
                      Icon={ArrowDownIcon}
                      size={Metrics.SPACE_LG}
                      color={Colors.COOL_GRAY_6}
                    />
                  }
                  style={{ width: 220 }}
                />
              </Form.Item>
            }
            addonAfter={
              <Text
                text="%"
                type="footnote"
                weight="semibold"
                color={Colors.COOL_GRAY_6}
              />
            }
            type="number"
            className="slo-target-input"
          />
        </Form.Item>
      );

    case 2:
      return (
        <Form.Item
          label={<Text text={TARGET.LABEL} weight="semibold" />}
          name={TARGET.NAME}
          rules={[
            {
              required: true,
              message: TARGET.ERROR,
            },
          ]}
        >
          <Space.Compact className="slo-target-input">
            <Select />
            <Flex align="center" justify="center" className="slo-target-level">
              <Text
                text="Level"
                type="footnote"
                weight="semibold"
                color={Colors.COOL_GRAY_6}
                customClass="slo-target-level-text"
              />
            </Flex>
          </Space.Compact>
        </Form.Item>
      );
  }
};

export default SLOTargetInput;
