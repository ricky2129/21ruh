import React from "react";
import { Link } from "react-router-dom";

import { Flex } from "antd";
import { RouteUrl } from "constant";

import SignupSuccessIcon from "assets/signup-success.svg";

import { IconViewer } from "components/IconViewer";
import { Text } from "components/Text";

import { Colors, Metrics } from "themes";

import "./successPage.styles.scss";

const SuccessPage: React.FC = () => {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={Metrics.SPACE_MD}
      className="forgetPassword-success-container"
    >
      <IconViewer
        Icon={SignupSuccessIcon}
        width={134}
        height={70}
        color={Colors.PRIMARY_BLUE}
      />
      <Text weight="semibold" type="header2" text="Mail Sent!" />
      <Text
        text={
          <span>
            Check your email for a link to reset your password. <br />
            If it doesn’t appear within a few minutes, check your spam folder
          </span>
        }
        customClass="confirmation-mail-text text-center"
      />

      <Link className="semibold" to={RouteUrl.ONBOARDING.LOGIN}>
        Return to Sign In
      </Link>
    </Flex>
  );
};

export default SuccessPage;
