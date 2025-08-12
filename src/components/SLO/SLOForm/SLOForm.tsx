import { useMemo } from "react";

import { Flex, Form, FormInstance, Select } from "antd";
import { sloFormConstants } from "constant";
import { SLOFormType, Tag } from "interfaces";

import { ArrowDownIcon } from "assets";

import { IconViewer, Input, MenuList, SLOTargetInput, Text } from "components";

import { Colors, Metrics } from "themes";

import "./sloForm.styles.scss";

interface SLOFormProps {
  sloDetailsForm: FormInstance<SLOFormType>;
  setDisabledSave: (disabledSave: boolean) => void;
  hideApplicationTags?: boolean;
}

const SLOForm: React.FC<SLOFormProps> = ({
  setDisabledSave,
  sloDetailsForm,
  hideApplicationTags = false,
}: SLOFormProps) => {
  const initialSloValues = useMemo(() => {
    const initialSloValues = {
      key: "",
      name: "",
      kpi: {
        title: "",
        subtitle: "",
      },
      target: {
        value: 0,
        unit: "%",
        criteria: ">=",
      },
    };

    if (!hideApplicationTags) {
      initialSloValues["application_tags"] = [{} as Tag, {} as Tag];
    }

    return initialSloValues;
  }, [hideApplicationTags]);
  const { SLO_NAME, KPI, APPLICATION_TAGS } = sloFormConstants;
  const selectedKPI = Form.useWatch(KPI.NAME, {
    form: sloDetailsForm,
    preserve: true,
  });

  const handleFormChange = () => {
    const hasErrors =
      sloDetailsForm?.getFieldsError().filter(({ errors }) => errors.length)
        .length > 0;

    setDisabledSave(hasErrors);
  };

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      <Form
        layout="vertical"
        form={sloDetailsForm}
        initialValues={initialSloValues}
        onFieldsChange={handleFormChange}
      >
        <Form.Item<SLOFormType>
          label={<Text text={SLO_NAME.LABEL} weight="semibold" />}
          name={SLO_NAME.NAME}
          rules={[
            {
              required: true,
              message: SLO_NAME.ERROR,
            },
          ]}
        >
          <Input placeholder={SLO_NAME.PLACEHOLDER} type="text" />
        </Form.Item>

        <Form.Item<SLOFormType>
          label={<Text text={KPI.LABEL} weight="semibold" />}
          name={KPI.NAME}
          rules={[
            {
              required: true,
              message: KPI.ERROR,
            },
          ]}
        >
          <Select
            showSearch
            placeholder={KPI.PLACEHOLDER}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={KPI.LIST.map((kpi) => ({
              label: kpi.NAME,
              value: kpi.VALUE,
            }))}
            suffixIcon={
              <IconViewer
                Icon={ArrowDownIcon}
                size={Metrics.SPACE_LG}
                color={Colors.COOL_GRAY_6}
              />
            }
          />
        </Form.Item>

        <SLOTargetInput target={selectedKPI} form={sloDetailsForm} />
        {!hideApplicationTags && (
          <Flex vertical gap={Metrics.SPACE_MD}>
            <Text
              text={APPLICATION_TAGS.LABEL}
              weight="semibold"
              type="cardtitle"
            />
            <MenuList
              title={APPLICATION_TAGS.NAME}
              showHideArrow={false}
              form={sloDetailsForm}
            />
          </Flex>
        )}
      </Form>
    </Flex>
  );
};

export default SLOForm;
