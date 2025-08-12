import { useCheckApplicationName } from "react-query";

import { InfoCircleFilled, LockOutlined } from "@ant-design/icons";
import { Alert, Flex, Form, Radio, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import { basicDetailsApplicationConstants } from "constant";
import { BasicDetailsApplicationFormField, Tag } from "interfaces";

import { InternalFilledIcon } from "assets";

import { IconViewer, Input, MenuList, Text } from "components";

import { useCreateApplication } from "context";

import { Colors, Metrics } from "themes";

interface BasicDetailsComponent {
  setDisabledSave: (boolean) => void;
  isError: boolean;
  error: string;
}

interface option {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const BasicDetails: React.FC<BasicDetailsComponent> = ({
  setDisabledSave,
  error,
  isError,
}) => {
  const privacyOption: option[] = [
    {
      label: "Internal",
      value: "Internal",
      icon: (
        <IconViewer
          Icon={InternalFilledIcon}
          color={Colors.COOL_GRAY_12}
          width={14}
          size={14}
        />
      ),
    },
    {
      label: "Private",
      value: "Private",
      icon: (
        <IconViewer
          Icon={LockOutlined}
          color={Colors.COOL_GRAY_6}
          width={14}
          size={14}
        />
      ),
    },
  ];
  const { basicDetailsForm } = useCreateApplication();
  const {
    APPLICATION_NAME,
    APPLICATION_DESCRIPTION,
    PRIMARY_TAGS,
    SECONDARY_TAGS,
    PRIVACY,
  } = basicDetailsApplicationConstants;

  const name: string = Form.useWatch(APPLICATION_NAME.NAME, {
    form: basicDetailsForm,
    preserve: true,
  });

  const checkProjectApplicationNameQuery = useCheckApplicationName(name);

  const handleFormChange = () => {
    const hasErrors =
      basicDetailsForm?.getFieldsError().filter(({ errors }) => errors.length)
        .length > 0;

    setDisabledSave(hasErrors);
  };

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      {isError && (
        <Alert
          className="error-message"
          message={error}
          type="error"
          icon={<InfoCircleFilled />}
          showIcon
          closable
        />
      )}
      <Form
        layout="vertical"
        form={basicDetailsForm}
        initialValues={{
          application_name: "",
          application_description: "",
          primary_tag: [{} as Tag, {} as Tag],
          secondary_tag: [{} as Tag, {} as Tag],
          privacy: "Internal",
        }}
        onFieldsChange={handleFormChange}
      >
        <Form.Item<BasicDetailsApplicationFormField>
          label={<Text text={APPLICATION_NAME.LABEL} weight="semibold" />}
          name={APPLICATION_NAME.NAME}
          rules={[
            {
              required: true,
              message: APPLICATION_NAME.ERROR,
            },
            {
              required: true,
              validator: async () => {
                try {
                  const res = await checkProjectApplicationNameQuery.refetch();

                  if (!res.data.available) {
                    return Promise.reject(APPLICATION_NAME.AVAILABILITY_ERROR);
                  }
                  return Promise.resolve();
                } catch {
                  return Promise.reject(APPLICATION_NAME.ERROR);
                }
              },
            },
          ]}
        >
          <Input
            placeholder={APPLICATION_NAME.PLACEHOLDER}
            type={APPLICATION_NAME.TYPE}
            onChange={() => {
              basicDetailsForm.validateFields([APPLICATION_NAME.NAME]);
            }}
          />
        </Form.Item>
        <Form.Item<BasicDetailsApplicationFormField>
          label={
            <Text text={APPLICATION_DESCRIPTION.LABEL} weight="semibold" />
          }
          name={APPLICATION_DESCRIPTION.NAME}
          rules={[
            {
              required: true,
              message: APPLICATION_DESCRIPTION.ERROR,
            },
          ]}
        >
          <TextArea
            placeholder={APPLICATION_DESCRIPTION.PLACEHOLDER}
            rows={5}
          />
        </Form.Item>
        <Flex vertical gap={Metrics.SPACE_MD}>
          <Text text="Tags" weight="semibold" type="cardtitle" />
          <MenuList
            form={basicDetailsForm}
            title={PRIMARY_TAGS.NAME}
            label={PRIMARY_TAGS.LABEL}
            fixedLength={true}
            showHideArrow={false}
          />
          <MenuList
            title={SECONDARY_TAGS.NAME}
            label={SECONDARY_TAGS.LABEL}
            form={basicDetailsForm}
          />
        </Flex>
        <br />
        <Form.Item<BasicDetailsApplicationFormField>
          label={<Text text={PRIVACY.LABEL} weight="semibold" />}
          name={PRIVACY.NAME}
        >
          <Radio.Group>
            <Space direction="vertical">
              {privacyOption?.map((option) => (
                <Radio value={option.value} key={option.value}>
                  {option.icon} <Text type="bodycopy" text={option.label} />
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default BasicDetails;
