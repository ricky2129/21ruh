import { useEffect, useRef } from "react";

import { Chart } from "@antv/g2";
import { MetricData } from "interfaces";

import "./serverUtilization.style.scss";

interface ServerUtilizationGraphProps {
  metric_data: MetricData[];
}

const ServerUtilizationGraph: React.FC<ServerUtilizationGraphProps> = ({
  metric_data,
}) => {
  const container = useRef(null);

  useEffect(() => {
    const chart = new Chart({
      container: container.current,
      autoFit: true,
      x: 3,
    });

    chart.data({
      value: metric_data,
      transform: [
        {
          type: "filter",
        },
      ],
    });

    chart
      .area()
      .encode("x", (d) => {
        const time = new Date(d.timestamp);
        return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
      })
      .encode("y", "value")
      .style("fill", "linear-gradient(-90deg, #8979FF4D 100%, #8979FF0D 0%)");

    chart
      .line()
      .encode("x", (d) => {
        const time = new Date(d.timestamp);
        return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
      })
      .encode("y", "value")
      .style("stroke", "#8979FF")
      .style("lineWidth", 2);

    // chart
    //   .guide()

    chart.render();

    return () => {
      chart.destroy();
    };
  }, [metric_data]);

  return <div ref={container} className="server-utilization"></div>;
};

export default ServerUtilizationGraph;
