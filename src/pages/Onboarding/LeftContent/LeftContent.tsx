import { Flex, Typography } from "antd";

import { Text } from "components";

import { Metrics } from "themes/theme";

import "./leftContent.styles.scss";

const { Title } = Typography;

export const LeftContent = () => {
  return (
    <Flex vertical wrap gap={Metrics.SPACE_XS} className="left-content">
      <Title className="left-content-title">ResSuite</Title>
      <Text
        type="subtitle"
        weight="regular"
        text="This product helps you proactively prepare and protect your applications"
        customClass="left-content-subtitle"
      />
    </Flex>
  );
};
