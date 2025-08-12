import { Progress } from "antd";

import "./progress.styles.scss";

interface ProgressProps {
  trailColor: string;
  strokeColor: string;
  percentage: number;
}

const ProgressComp: React.FC<ProgressProps> = ({
  trailColor = "#ffffff",
  strokeColor,
  percentage,
}: ProgressProps) => {
  return (
    <div className="progress-bar">
      <Progress
        type="circle"
        percent={percentage}
        strokeColor={{
          "0%": `${strokeColor}`,
          "100%": `${strokeColor}`,
        }}
        size={16}
        trailColor={trailColor}
        strokeWidth={50}
      />
    </div>
  );
};

export default ProgressComp;
