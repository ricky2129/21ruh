import { CheckCircleOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { FileData } from "interfaces";

import { Progress } from "assets";

import { IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./filesAnalysed.styles.scss";

interface FilesAnalysedProps {
  files: FileData[];
}

/**
 * Renders a list of files with their respective analysis status.
 *
 * @param {FilesAnalysedProps} props - Properties passed to the component.
 * @param {fileData[]} props.files - Array of file data objects.
 * @returns {ReactElement} A React element representing the component.
 */
const FilesAnalysed: React.FC<FilesAnalysedProps> = ({ files }) => {
  return (
    <Flex vertical gap={Metrics.SPACE_XS}>
      <Text text="Files analysed" type="bodycopy" weight="semibold" />
      <Flex vertical gap={Metrics.SPACE_XS} className="files-container">
        {files?.map((data, index) => (
          <Flex
            align="center"
            justify="space-between"
            key={index}
            gap={Metrics.SPACE_XS}
            className="file-details-container"
          >
            <Flex align="center" gap={Metrics.SPACE_XS}>
              <IconViewer
                Icon={
                  data.scanStatus === "SUCCESS"
                    ? CheckCircleOutlined
                    : Progress
                }
                color={
                  data.scanStatus === "SUCCESS"
                    ? Colors.PRIMARY_GREEN_600
                    : Colors.PRIMARY_BLUE
                }
              />
              <Text text={data.fileName} type="footnote" color={Colors.BLACK} />
            </Flex>
            {data.scanStatus === "RUNNING" ? (
              <Text
                text="In-Progress"
                type="footnote"
                color={Colors.PRIMARY_BLUE}
              />
            ) : (
              ""
            )}
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default FilesAnalysed;
