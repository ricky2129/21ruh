import React, { useCallback, useRef, useState } from "react";
import { useSignup } from "react-query/authQueries";

import { ArrowLeftOutlined, InfoCircleFilled } from "@ant-design/icons";
import { Alert, Flex, Input } from "antd";
import { onboardingConstants } from "constant";
import { SignupFormFieldType } from "interfaces";

import { Button, Loading, Text } from "components";

import { useAuth } from "context";

import { Metrics } from "themes";

import "./configureMfa.styles.scss";

interface SignUpFormProps {
  setSignupCurrentTab: (integer) => void;
  signupFields: SignupFormFieldType;
  qr: Blob;
}

const ConfigureMfa: React.FC<SignUpFormProps> = ({
  signupFields,
  setSignupCurrentTab,
  qr,
}) => {
  const { reset } = useAuth();
  const { CONFIGURE_MFA } = onboardingConstants;
  const [otpInput, setOtpInput] = useState<string>("");
  const [disabledSave, setDisabledSave] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const otpRef = useRef(null);

  const signupQuery = useSignup();
  const url = window.URL.createObjectURL(qr);

  /**
   * Reset on Click of cancel button
   */
  const handleReset = useCallback(() => {
    setSignupCurrentTab(0);
    reset();
  }, [setSignupCurrentTab, reset]);

  /**
   * @returns void
   * */
  const signup = useCallback(async () => {
    try {
      setIsLoading(true);
      const { first_name, last_name, email, password } = signupFields;
      await signupQuery.mutateAsync({
        first_name,
        last_name,
        email,
        password,
        otp: otpInput,
      });

      setSignupCurrentTab(2);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.detail?.toString() ||
          onboardingConstants.ERROR_MESSAGE,
      );
    } finally {
      setIsLoading(false);
    }
  }, [signupQuery, signupFields, setSignupCurrentTab, otpInput]);

  return (
    <Flex vertical gap={Metrics.SPACE_XXL} className="configureMfa-container">
      {isLoading && <Loading />}
      <Flex vertical gap={Metrics.SPACE_XS}>
        <Flex gap={4} className="cursor-pointer" onClick={handleReset}>
          <ArrowLeftOutlined />
          <Text type="bodycopy" text="Back" />
        </Flex>
        <Text
          type="header2"
          text={CONFIGURE_MFA.TITLE}
          customClass="auth-title"
          weight="semibold"
        />

        <Text
          type="bodycopy"
          text={CONFIGURE_MFA.SUBTITLE}
          customClass="scan-text"
        />
      </Flex>

      {signupQuery.isError && (
        <Alert
          message={errorMessage}
          type="error"
          icon={<InfoCircleFilled />}
          showIcon
          closable
        />
      )}

      <Flex justify="center" align="center" className="qr-container">
        <img src={url} alt="QR not available" width={220} height={220} />
      </Flex>

      <Flex gap={Metrics.SPACE_XS} vertical>
        <Text
          type="cardtitle"
          weight="bold"
          text={CONFIGURE_MFA.CONFIG_MFA_TEXT}
          customClass="text-center"
        />
        <Text
          type="bodycopy"
          text={CONFIGURE_MFA.CONFIG_MFA_TEXT2}
          customClass="scan-text text-center"
        />

        <Flex justify="center" className="otp-input">
          <Input.OTP
            ref={otpRef}
            onChange={(text) => setOtpInput(text)}
            onKeyDown={(event) => {
              if (event.key != "Backspace" && !/[0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
            onKeyUp={() => {
              setDisabledSave(
                [...otpRef.current.nativeElement.children]
                  .map((e) => e.value)
                  .join("").length !== 6,
              );
            }}
          />
        </Flex>
      </Flex>

      <Flex vertical gap={Metrics.SPACE_MD}>
        <Button
          title={CONFIGURE_MFA.SUBMIT}
          customClass="semibold configuremfa-action-buttons"
          onClick={signup}
          disabled={disabledSave || isLoading}
          loading={isLoading}
        />
        <Button
          title={CONFIGURE_MFA.CANCEL}
          type="default"
          onClick={handleReset}
          customClass="semibold configuremfa-action-buttons"
        />
      </Flex>
    </Flex>
  );
};

export default ConfigureMfa;
