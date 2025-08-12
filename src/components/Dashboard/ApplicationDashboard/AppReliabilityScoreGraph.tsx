import React, { useEffect, useState } from "react";

import { Column, ColumnConfig } from "@ant-design/plots";

interface AppReliabilityScoreGraphProps {
  data: { version: string; score: number }[];
}

const AppReliabilityScoreGraph: React.FC<AppReliabilityScoreGraphProps> = ({
  data,
}) => {
  const [config, setConfig] = useState<ColumnConfig>({} as ColumnConfig);

  useEffect(() => {
    setConfig({
      data: data.map((d) => ({
        version: `Version ${d.version}.0`,
        score: d.score ? d.score : 0,
      })),
      xField: "version",
      yField: "score",
      colorField: ["#007CB0"],
      scrollbar: {
        x: {
          visible: true,
        },
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
      axis: {
        x: {
          title: "Versions (Latest 3 versions)",
        },
        y: {
          title: "Reliability",
        },
      },
    } as ColumnConfig);
  }, [data]);

  return <Column {...config} />;
};

export default AppReliabilityScoreGraph;
