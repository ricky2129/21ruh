import React, { useEffect, useState } from "react";

import { Column, ColumnConfig } from "@ant-design/plots";

interface PortfolioReliabilityScoreGraphProps {
  data: { app: string; score: number }[];
}

const PortfolioReliabilityScoreGraph: React.FC<
  PortfolioReliabilityScoreGraphProps
> = ({ data }) => {
  const [config, setConfig] = useState<ColumnConfig>({} as ColumnConfig);

  useEffect(() => {
    setConfig({
      data: data,
      xField: "app",
      yField: "score",
      colorField: ["#007CB0"],
      label: {
        text: (d) => d.score,
        textBaseline: "bottom",
      },
      height: 310,
      style: {
        maxWidth: 15,
      },
      conversionTag: {
        size: 20,
        spacing: 8,
      },
      scale: {
        y: {
          domain: [0, 100],
        },
      },
    });
  }, [data]);

  return <Column {...config} />;
};

export default PortfolioReliabilityScoreGraph;
