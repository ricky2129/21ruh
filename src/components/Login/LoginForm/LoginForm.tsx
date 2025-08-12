import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { InfoCircleFilled } from "@ant-design/icons";
import { Alert, Flex, Form } from "antd";
import { RouteUrl } from "constant";
import { onboardingConstants } from "constant/onboarding.constants";
import { LoginFormFieldType } from "interfaces";

import { Button, Input, Text } from "components";

import { useAuth } from "context/AuthProvider";

import { Colors, Metrics } from "themes";

import "./loginForm.styles.scss";

const LoginForm: React.FC = () => {
  const [disabledSave, setDisabledSave] = useState<boolean>(false);

  const [form] = Form.useForm<LoginFormFieldType>();
  const { LOGIN, PASSWORD } = onboardingConstants;
  const { login, reset, errorMessage, isLoading, isError } = useAuth();

  useEffect(() => {
    reset();
  }, []);

  const handleFormChange = () => {
    const hasErrors =
      !form.isFieldsTouched(true) ||
      form.getFieldsError().filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  const handleLogin = () => {
    login({
      email: form.getFieldValue("username"),
      password: form.getFieldValue("password"),
    });
  };

  return (
    <Flex align="center" justify="center" className="auth-container">
      <Flex vertical gap={Metrics.SPACE_XL} className="form-wrapper">
        <Flex vertical gap={Metrics.SPACE_XS}>
          <Text text={LOGIN.TITLE} type="header2" weight="semibold" />
          <Text text={LOGIN.SUBTITLE} customClass="subtitle" />
        </Flex>

        {isError && (
          <Alert
            className="error-message"
            message={errorMessage}
            type="error"
            icon={<InfoCircleFilled />}
            showIcon
            closable
          />
        )}

        <Form layout="vertical" form={form} onFieldsChange={handleFormChange}>
          <Flex vertical>
            <Form.Item<LoginFormFieldType>
              label={<Text text={LOGIN.USERNAME.LABEL} weight="semibold" />}
              name="username"
              rules={[
                {
                  required: true,
                  message: LOGIN.USERNAME.ERROR_MESSAGE,
                  type: "email",
                },
              ]}
            >
              <Input placeholder={LOGIN.USERNAME.PLACEHOLDER} type="email" />
            </Form.Item>

            <Form.Item<LoginFormFieldType>
              label={<Text text={PASSWORD.LABEL} weight="semibold" />}
              name={"password"}
              rules={[{ required: true, message: PASSWORD.ERROR_MESSAGE }]}
            >
              <Input placeholder={PASSWORD.PLACEHOLDER} type="password" />
            </Form.Item>

            <Link to={RouteUrl.ONBOARDING.FORGOT_PASSWORD}>
              <Text
                text={LOGIN.FORGOT_PASSWORD}
                weight="semibold"
                color={Colors.PRIMARY_BLUE}
              />
            </Link>
          </Flex>
        </Form>
        <Flex>
          <Button
            loading={isLoading}
            disabled={isLoading || disabledSave}
            title={LOGIN.BUTTON_LABEL}
            type="primary"
            fullWidth={true}
            onClick={handleLogin}
          />
          {/* TODO: Add SSO */}
          {/* <div className="sso-link">
            <Link to="/sso">Use single sign on</Link>
          </div> */}
        </Flex>
        <Flex justify="center" gap={Metrics.SPACE_XXS}>
          <Text text={LOGIN.SIGNUP_MESSAGE} weight="semibold" />
          <Link to={RouteUrl.ONBOARDING.SIGNUP}>
            <Text
              text={LOGIN.SIGNUP_LABEL}
              weight="semibold"
              customClass="text-link"
              color={Colors.PRIMARY_BLUE}
            />
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LoginForm;
