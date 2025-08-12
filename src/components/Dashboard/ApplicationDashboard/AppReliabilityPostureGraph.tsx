import React, { useEffect, useState } from "react";

import { Bar, BarConfig } from "@ant-design/charts";

interface AppReliabilityPostureGraphProps {
  data: {
    env_name: string;
    env_id: number;
    actual_reliability_score: number;
    forecast_reliability_score: number;
  };
}

const AppReliabilityPostureGraph: React.FC<AppReliabilityPostureGraphProps> = ({
  data,
}) => {
  const [config, setConfig] = useState<BarConfig>({} as BarConfig);

  useEffect(() => {
    setConfig({
      data: [
        {
          type: "Actual",
          version: "1.0",
          value: data ? data.actual_reliability_score : 0,
        },
        {
          type: "Forecasted",
          version: "1.0",
          value: data
            ? data.forecast_reliability_score - data.actual_reliability_score
            : 0,
        },
      ],
      height: 310,
      xField: "version",
      yField: "value",
      stack: true,
      interaction: { tooltip: !!data },

      axis: {
        x: {
          title: "Version (latest)",
          label: false,
        },
        y: {
          title: "Reliability",
        },
      },

      colorField: "type",
      legend: {
        color: { size: 72, autoWrap: true, maxRows: 3, cols: 6 },
      },
      style: {
        maxWidth: 40,
      },

      scale: {
        y: {
          domain: [0, 100],
        },
        color: {
          range: ["#007CB0", "#A0DCFF"],
        },
      },
      tooltip: (
        d, // each data item
        index, // index
        data, // complete data
        column, // channel
      ) => ({
        value: `${
          index & 1
            ? "Forecasted Reliablity: " + column.y.value[index]
            : "Actual Reliablity: " + d.value
        }%`,
      }),
    });
  }, [data]);

  return <Bar {...config} />;
};

export default AppReliabilityPostureGraph;
