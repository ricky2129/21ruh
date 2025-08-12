import { Link } from "react-router-dom";

import { Flex } from "antd";
import { APP_NAME, RouteUrl } from "constant";

import SignupSuccessIcon from "assets/signup-success.svg";

import { IconViewer } from "components/IconViewer";
import { Text } from "components/Text";

import { Colors } from "themes";

import "./signupSuccess.style.scss";

interface SignUpFormProps {
  setSignupCurrentTab: (integer) => void;
  email: string;
}

const SignupSuccess: React.FC<SignUpFormProps> = ({ email }) => {
  return (
    <Flex
      vertical
      align="center"
      className="signup-success-container"
      justify="center"
      gap={16}
    >
      <IconViewer
        Icon={SignupSuccessIcon}
        width={134}
        height={70}
        color={Colors.PRIMARY_BLUE}
      />
      <Text weight="semibold" type="header2" text="Awesome!" />
      <Text
        text={`You now have a ${APP_NAME} account.`}
        type="cardtitle"
        weight="semibold"
        customClass="successText"
      />
      <br />
      <Flex vertical className="text-center">
        <Text
          weight="semibold"
          text="We have send a confirmation email to:"
          customClass="confirmation-mail-text"
        />
        <Text weight="semibold" type="bodycopy" text={email} />
      </Flex>
      <span
        className="semibold text-center"
        style={{ color: Colors.COOL_GRAY_9 }}
      >
        Click to
        <Link to={RouteUrl.ONBOARDING.LOGIN}> Log In </Link>
      </span>
    </Flex>
  );
};

export default SignupSuccess;
