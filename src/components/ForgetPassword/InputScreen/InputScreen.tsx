import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Flex, Form } from "antd";
import { RouteUrl } from "constant";
import { onboardingConstants } from "constant/onboarding.constants";
import { LoginFormFieldType } from "interfaces";

import { Button, Input, Text } from "components";

import { Metrics } from "themes";

import "./inputScreen.styles.scss";

const InputScreen: React.FC = () => {
  const Navigate = useNavigate();
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const [form] = Form.useForm<LoginFormFieldType>();
  const { EMAIL, FORGET_PASSWORD } = onboardingConstants;

  const handleFormChange = () => {
    const hasErrors =
      form.getFieldsError().filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  const handleForgetPassword = async () => {
    try {
      await form.validateFields();
      Navigate(RouteUrl.ONBOARDING.FORGOT_PASSWORD_SUCCESS);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Flex align="center" justify="center" className="auth-container">
      <Flex vertical gap={Metrics.SPACE_XL} className="form-wrapper">
        <Flex vertical gap={Metrics.SPACE_XS}>
          <Text text={FORGET_PASSWORD.TITLE} type="header2" weight="semibold" />
          <Text text={FORGET_PASSWORD.SUBTITLE} customClass="subtitle" />
        </Flex>

        {/* {isError && (
          <Alert
            className="error-message"
            message={errorMessage}
            type="error"
            icon={<InfoCircleFilled />}
            showIcon
            closable
          />
        )} */}

        <Form layout="vertical" form={form} onFieldsChange={handleFormChange}>
          <Flex vertical>
            <Form.Item<LoginFormFieldType>
              label={<Text text={EMAIL.LABEL} weight="semibold" />}
              name="username"
              rules={[
                {
                  required: true,
                  message: EMAIL.ERROR,
                  type: "email",
                },
              ]}
            >
              <Input placeholder={EMAIL.PLACEHOLDER} type="email" />
            </Form.Item>
          </Flex>
        </Form>
        <Flex>
          <Button
            disabled={disabledSave}
            title={FORGET_PASSWORD.BUTTON_LABEL}
            type="primary"
            fullWidth={true}
            onClick={handleForgetPassword}
          />
          {/* TODO: Add SSO */}
          {/* <div className="sso-link">
            <Link to="/sso">Use single sign on</Link>
          </div> */}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default InputScreen;
