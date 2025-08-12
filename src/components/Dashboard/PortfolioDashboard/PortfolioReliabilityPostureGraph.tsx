import React, { useEffect, useState } from "react";

import { Bar, BarConfig } from "@ant-design/charts";
import { PortfolioGraphResponse } from "interfaces";

interface PortfolioReliabilityPostureGraphProps {
  data: PortfolioGraphResponse[];
}

const PortfolioReliabilityPostureGraph: React.FC<
  PortfolioReliabilityPostureGraphProps
> = ({ data }) => {
  const [config, setConfig] = useState<BarConfig>({} as BarConfig);

  useEffect(() => {
    setConfig({
      data: data.flatMap((d) => [
        {
          type: "Actual",
          app: d.app_name,
          value: d?.actual_reliability_score || 0,
        },
        {
          type: "Forecasted",
          app: d.app_name,
          value:
            d?.forecast_reliability_score - d?.actual_reliability_score || 0,
        },
      ]),
      height: 310,
      xField: "app",
      yField: "value",
      stack: true,

      axis: {
        x: {
          title: "Applications",
        },
        y: {
          title: "Reliability",
        },
      },

      colorField: "type",
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
        value: `${index & 1 ? column.y.value[index] : d.value}%`,
      }),
    });
  }, [data]);

  return <Bar {...config} />;
};

export default PortfolioReliabilityPostureGraph;
