import { Flex } from "antd";

import { EmptyProjectCloud } from "assets";

import { IconViewer, Text } from "components";

import { Metrics } from "themes";

import "./empty.styles.scss";

interface IEmptyProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

const Empty: React.FC<IEmptyProps> = ({ title, subtitle, children }) => {
  return (
    <Flex justify="center" align="center" vertical className="empty-container">
      <Flex justify="center" align="center" className="empty-poster">
        <IconViewer Icon={EmptyProjectCloud} width={87} height={51} />
      </Flex>

      <Flex gap={Metrics.SPACE_XXS} vertical className="empty-header">
        <Text text={title} type="subtitle" weight="semibold" />
        <Text text={subtitle} customClass="header-subtitle" />
      </Flex>

      <Flex style={{ marginTop: Metrics.SPACE_MD }}>{children}</Flex>
    </Flex>
  );
};

export default Empty;
