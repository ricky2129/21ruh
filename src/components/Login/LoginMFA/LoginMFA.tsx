import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { InfoCircleFilled } from "@ant-design/icons";
import { Alert, Flex, Input } from "antd";
import { RouteUrl, onboardingConstants } from "constant";

import { Button, Loading, Text } from "components";

import { useAuth } from "context";

import { Metrics } from "themes";

import "./loginMFA.styles.scss";

const LoginMFA: React.FC = () => {
  const { isLoggedIn, verifyMFA, reset, isLoading, isError, errorMessage } =
    useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string>("");
  const { LOGIN_MFA } = onboardingConstants;
  const [disabledSave, setDisabledSave] = useState<boolean>(true);
  const otpRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) navigate(RouteUrl.ONBOARDING.LOGIN);
  }, [navigate, isLoggedIn]);

  const onVerifyMFA = () => {
    verifyMFA(otp);
  };

  const onCancel = () => {
    reset();
    navigate(RouteUrl.HOME.DASHBOARD);
  };

  return (
    <Flex align="center" justify="center" className="mfa-container">
      {isLoading && <Loading />}
      <Flex vertical gap={Metrics.SPACE_XL} className="form-wrapper">
        <Flex vertical gap={Metrics.SPACE_XS}>
          <Text text={LOGIN_MFA.TITLE} type="header2" weight="semibold" />
          <Text text={LOGIN_MFA.SUBTITLE} customClass="subtitle" />
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

        <Flex justify="center" className="otp-input">
          <Input.OTP
            autoFocus
            ref={otpRef}
            onChange={(text) => setOtp(text)}
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

        <Flex vertical gap={Metrics.SPACE_MD}>
          <Button
            title={LOGIN_MFA.VERIFY_BTN_LABEL}
            type="primary"
            fullWidth={true}
            disabled={disabledSave || isLoading}
            onClick={onVerifyMFA}
            loading={isLoading}
          />
          <Button
            title={LOGIN_MFA.CANCEL_BTN_LABEL}
            type="default"
            fullWidth={true}
            onClick={onCancel}
          />
          <Flex justify="center" gap={Metrics.SPACE_XXS}>
            <Text
              text={LOGIN_MFA.MFA_SETUP_MESSAGE}
              weight="semibold"
              customClass="mfa-setup-message"
            />
            <Text
              text={LOGIN_MFA.MFA_SETUP_LINK}
              weight="semibold"
              customClass="text-link"
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LoginMFA;
