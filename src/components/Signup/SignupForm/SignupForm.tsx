import { useEffect, useState } from "react";
import { useGenerateMfa } from "react-query/authQueries";
import { Link } from "react-router-dom";

import { CheckCircleFilled, InfoCircleFilled } from "@ant-design/icons";
import { Alert, Flex, Form } from "antd";
import { Rule } from "antd/es/form";
import { RouteUrl, onboardingConstants } from "constant";
import { SignupFormFieldType } from "interfaces";

import { Button, IconViewer, Input, Text } from "components";

import { useAuth } from "context";

import { Colors, Metrics } from "themes";

import "./signupForm.styles.scss";

interface SignUpFormProps {
  setSignupCurrentTab: (integer) => void;
  signupFields: SignupFormFieldType;
  setSignupFields: (SignupFormFieldType) => void;
  setQr: (Blob) => void;
}

const SignupForm: React.FC<SignUpFormProps> = ({
  setSignupCurrentTab,
  signupFields,
  setSignupFields,
  setQr,
}) => {
  const { reset } = useAuth();
  const [disabledSave, setDisabledSave] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateMFAQuery = useGenerateMfa();

  const [form] = Form.useForm();

  const { SIGNUP, PASSWORD, REQUIRED_ERROR_MESSAGE, EMAIL } =
    onboardingConstants;
  const { TITLE, FIRSTNAME, LASTNAME, CONFIRMPASSWORD } = SIGNUP;

  const passwordRules: Rule[] = [
    { required: true, message: "Password is required", },
    { min: 8, message: PASSWORD.MIN_LENGTH_ERROR },
    {
      pattern: /[A-Z]/,
      message: PASSWORD.UPPERCASE_ERROR,
    },
    {
      pattern: /[a-z]/,
      message: PASSWORD.LOWERCASE_ERROR,
    },
    {
      pattern: /[@$!%*?&]/,
      message: PASSWORD.SPECIAL_CHARACTER_ERROR,
    },
  ];

  useEffect(() => {
    reset();
  }, []);

  /**
   * handle Form change
   */
  const handleFormChange = () => {
    const hasErrors =
      form.getFieldsError().filter(({ errors }) => errors.length).length > 0;

    setDisabledSave(hasErrors);
  };

  /**
   * Generates MFA QR code based on user's email
   */
  const handleGenerateMFA = async () => {
    try {
      setIsLoading(true);

      await form.validateFields();
      const signupData: SignupFormFieldType = form.getFieldsValue();

      if (signupFields?.email !== signupData?.email) {
        const res = await generateMFAQuery.mutateAsync(signupData?.email);
        setQr(res);
      }

      setSignupFields(signupData);
      setSignupCurrentTab(1);
    } catch (error) {
      setErrorMessage(
        JSON.parse(await error?.response?.data?.text())?.detail ||
          onboardingConstants.ERROR_MESSAGE,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" className="auth-container">
      <Flex vertical gap={Metrics.SPACE_LG} className="signup-container">
        <Text
          type="header2"
          text={TITLE}
          weight="semibold"
          customClass="auth-title"
        />
        {generateMFAQuery.isError && (
          <Alert
            message={errorMessage}
            type="error"
            icon={<InfoCircleFilled />}
            showIcon
            closable
          />
        )}

        <Form
          layout="vertical"
          initialValues={signupFields}
          form={form}
          onFieldsChange={handleFormChange}
        >
          <Form.Item<SignupFormFieldType>
            label={<Text weight="semibold" text={FIRSTNAME.LABEL} />}
            name="first_name"
            rules={[{ required: true, message: REQUIRED_ERROR_MESSAGE }]}
          >
            <Input placeholder={FIRSTNAME.PLACEHOLDER} type="text" />
          </Form.Item>

          <Form.Item<SignupFormFieldType>
            label={<Text weight="semibold" text={LASTNAME.LABEL} />}
            name="last_name"
            rules={[{ required: true, message: REQUIRED_ERROR_MESSAGE }]}
          >
            <Input placeholder={LASTNAME.PLACEHOLDER} type="text" />
          </Form.Item>

          <Form.Item<SignupFormFieldType>
            label={<Text weight="semibold" text={EMAIL.LABEL} />}
            name="email"
            rules={[
              {
                required: true,
                message: REQUIRED_ERROR_MESSAGE,
                type: "email",
              },
            ]}
          >
            <Input placeholder={EMAIL.PLACEHOLDER} type="text" />
          </Form.Item>

          <Form.Item<SignupFormFieldType>
            label={<Text weight="semibold" text={PASSWORD.LABEL} />}
            name="password"
            rules={passwordRules}
            className="signup-fields"
          >
            <Input placeholder={PASSWORD.PLACEHOLDER} type="password" />
          </Form.Item>

          <Form.Item<SignupFormFieldType>
            label={<Text text={CONFIRMPASSWORD.LABEL} weight="semibold" />}
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: REQUIRED_ERROR_MESSAGE,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(CONFIRMPASSWORD.MISMATCH_ERROR_MESSAGE),
                  );
                },
              }),
            ]}
          >
            <Input placeholder={CONFIRMPASSWORD.PLACEHOLDER} type="password" />
          </Form.Item>

          <Flex gap={Metrics.SPACE_XXS}>
            <IconViewer
              Icon={CheckCircleFilled}
              color={Colors.PRIMARY_GREEN_600}
            />
            <Text
              customClass="multi-factor-authentication"
              text="Multi Factor Authentication"
              weight="semibold"
            />
          </Flex>
        </Form>

        <Button
          title="Next"
          type="primary"
          loading={isLoading}
          disabled={isLoading || disabledSave}
          onClick={handleGenerateMFA}
        />

        <span className="semibold text-center">
          Already having an account ?{" "}
          <Link to={RouteUrl.ONBOARDING.LOGIN}> Sign In </Link>
        </span>
      </Flex>
    </Flex>
  );
};

export default SignupForm;
