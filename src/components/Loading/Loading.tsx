import { Flex, Modal, Spin } from "antd";

import { LoadingGif } from "assets";

import { Text } from "components/Text";

import { Metrics } from "themes";

interface LoadingProps {
  type?: "fullscreen" | "spinner";
}

/**
 * Loading component
 * @param {Object} props Component props
 * @param {"large" | "small" | "default"} [props.size="large"] Size of the spinner
 * @param {"fullscreen"} [props.type] Type of the loader, if set to "fullscreen" the loader will fill the screen
 * @returns {JSX.Element} The Loading component
 */
const Loading: React.FC<LoadingProps> = ({
  type = "fullscreen",
}): JSX.Element => {
  return type === "spinner" ? (
    <Flex align="center" justify="center" style={{ padding: 2 }}>
      <Spin size="large" />
    </Flex>
  ) : (
    <Modal
      open={true}
      centered
      closable={false}
      footer={null}
      title={null}
      maskAnimation={null}
      width={260}
    >
      <Flex
        vertical
        gap={Metrics.SPACE_SM}
        align="center"
        style={{ height: "170px" }}
        justify="center"
      >
        <Text weight="semibold" text="Please Wait ..." type="cardtitle" />

        <img src={LoadingGif} alt="" width={58} height={58} />
      </Flex>
    </Modal>
  );
};

export default Loading;
