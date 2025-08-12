interface CircularProgressProps {
  percentage: number;
  diameter: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  diameter,
}) => {
  percentage -= 0.001;
  const radius = diameter / 2;
  const percentageValue = (percentage / 100) * 360;
  const sector = createSector(percentageValue, radius);

  let color: string;
  if (percentage <= 25) {
    color = "red";
  } else if (percentage <= 70) {
    color = "orange";
  } else {
    color = "green";
  }

  function createSector(percentageValue: number, radius: number) {
    const angle = (percentageValue - 90) * (Math.PI / 180); // Adjusting for starting position
    const largeArc = percentage > 50 ? 1 : 0;
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    return `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y} Z`;
  }

  return (
    <svg height={diameter} width={diameter}>
      <path d={sector} fill={color} />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth="1"
        r={radius - 0.5}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

export default CircularProgress;
