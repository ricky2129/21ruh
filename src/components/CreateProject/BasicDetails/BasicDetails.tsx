import React from "react";
import { useCheckProjectName } from "react-query";

import { LockOutlined } from "@ant-design/icons";
import { Flex, Form, Radio, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import { basicDetailsConstants } from "constant";
import { BasicDetailsFormField, Tag } from "interfaces";

import { InternalFilledIcon } from "assets";

import { IconViewer, Input, MenuList, Text } from "components";

import { useCreateProject } from "context";

import { Colors, Metrics } from "themes";

import "./BasicDetails.styles.scss";

interface BasicDetailsComponent {
  setDisabledSave: (boolean) => void;
}

interface option {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const BasicDetails: React.FC<BasicDetailsComponent> = ({ setDisabledSave }) => {
  const { basicDetailsForm, projectId } = useCreateProject();
  const {
    PROJECT_NAME,
    PROJECT_DESCRIPTION,
    PRIMARY_TAGS,
    SECONDARY_TAGS,
    PRIVACY,
  } = basicDetailsConstants;

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

  const handleFormChange = () => {
    const hasErrors =
      basicDetailsForm?.getFieldsError().filter(({ errors }) => errors.length)
        .length > 0;

    setDisabledSave(hasErrors);
  };

  const name: string = Form.useWatch(PROJECT_NAME.NAME, {
    form: basicDetailsForm,
    preserve: true,
  });

  const checkProjectNameQuery = useCheckProjectName(name);

  return (
    <Flex vertical gap={Metrics.SPACE_LG}>
      <Form
        layout="vertical"
        form={basicDetailsForm}
        initialValues={{
          project_name: "",
          project_description: "",
          primary_tag: [{} as Tag, {} as Tag],
          secondary_tag: [{} as Tag, {} as Tag],
          privacy: "Internal",
        }}
        onFieldsChange={handleFormChange}
      >
        <Form.Item<BasicDetailsFormField>
          label={<Text text={PROJECT_NAME.LABEL} weight="semibold" />}
          name={PROJECT_NAME.NAME}
          rules={[
            {
              required: true,
              message: PROJECT_NAME.ERROR,
            },
            {
              required: true,
              validator: async () => {
                try {
                  if (projectId === null) {
                    const res = await checkProjectNameQuery.refetch();

                    if (!res.data.available) {
                      return Promise.reject(
                        PROJECT_NAME.CHECK_PROJECT_NAME_ERROR,
                      );
                    }
                  }

                  return Promise.resolve();
                } catch {
                  return Promise.reject(PROJECT_NAME.CHECK_PROJECT_NAME_ERROR);
                }
              },
            },
          ]}
        >
          <Input
            placeholder={PROJECT_NAME.PLACEHOLDER}
            type={PROJECT_NAME.TYPE}
          />
        </Form.Item>
        <Form.Item<BasicDetailsFormField>
          label={<Text text={PROJECT_DESCRIPTION.LABEL} weight="semibold" />}
          name={PROJECT_DESCRIPTION.NAME}
          rules={[
            {
              required: true,
              message: PROJECT_DESCRIPTION.ERROR,
            },
          ]}
        >
          <TextArea placeholder={PROJECT_DESCRIPTION.PLACEHOLDER} rows={5} />
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
        <Form.Item<BasicDetailsFormField>
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
