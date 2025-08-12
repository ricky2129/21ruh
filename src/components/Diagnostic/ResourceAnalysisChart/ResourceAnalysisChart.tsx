import { useEffect, useState } from "react";

import { Pie, PieConfig } from "@ant-design/charts";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Renderer } from "@antv/g-svg";
import { Flex } from "antd";
import { ResourceAnalysisChartProps } from "interfaces";

import { IconViewer, Text } from "components";

import { Colors, Metrics } from "themes";

import "./resourceAnalysis.styles.scss";

const ResourceAnalysisChart: React.FC<{
  data: ResourceAnalysisChartProps;
}> = ({ data }) => {
  const [config, setConfig] = useState<PieConfig>({} as PieConfig);

  useEffect(() => {
    setConfig({
      renderer: new Renderer(),
      data: data.chartData,
      legend: false,
      angleField: "value",
      colorField: "label",
      margin: 0,
      height: 212,
      width: 212,
      autoFit: true,
      style: {
        inset: 0.5,
      },
      scale: {
        color: {
          range: Colors.DIAGNOSTICS_CHART_COLORS,
        },
      },
      innerRadius: 0.65,
    } as PieConfig);
  }, [data]);

  return (
    <Flex gap={Metrics.SPACE_XL} className="chart-container">
      <Flex className="chart-wrapper">
        <Pie {...config} className="chart" />
        <Flex className="chart-annotation">
          <Flex vertical>
            <Text
              text={`${data.resillencyScore}%`}
              type="header2"
              color={Colors.PRIMARY_BLUE}
            />
          </Flex>
        </Flex>
      </Flex>

      <Flex vertical gap={Metrics.SPACE_XS} justify="center">
        {data?.chartData?.map((d, index) => (
          <Flex
            vertical
            key={d.label}
            style={{
              borderLeft: `2px solid ${Colors.DIAGNOSTICS_CHART_COLORS[index % 4]}`,
            }}
            className="chart-legend"
          >
            <Text text={d.label} type="footnote" />
            <Text
              text={`${d.value}%`}
              type="cardtitle"
              weight="semibold"
              color={Colors.DIAGNOSTICS_CHART_COLORS[index % 4]}
            />
          </Flex>
        ))}
      </Flex>

      <Flex vertical gap={Metrics.SPACE_XXS / 2} align="stretch" flex={1}>
        {data?.recommendationList?.map((d) => (
          <Flex
            flex={1}
            key={d.label}
            gap={Metrics.SPACE_XS}
            align="center"
            className="chart-right-box"
          >
            <IconViewer
              Icon={CheckCircleOutlined}
              color={Colors.PRIMARY_GREEN_600}
            />
            <Text
              text={d.label}
              type="cardtitle"
              weight="semibold"
              color={Colors.PRIMARY_BLUE}
              customClass="chart-right-text"
            />
            <Text text={`${d.value}`} type="cardtitle" weight="semibold" />
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default ResourceAnalysisChart;
