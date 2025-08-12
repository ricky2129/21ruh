import { Card as AntdCard } from "antd";

import { Metrics } from "themes";

import "./card.styles.scss";

interface CardProps {
  loading?: boolean;
  hoverable?: boolean;
  padding?: number;
  height?: number;
  borderRadius?: number;
  flexGap?: number;
  children: React.ReactNode;
  customClass?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  loading = false,
  hoverable = false,
  padding = Metrics.SPACE_MD,
  height = Metrics.CARD_HEIGHT_DEFAULT,
  borderRadius = Metrics.CARD_BORDER_RADIUS,
  flexGap = Metrics.ZERO,
  onClick = () => {},
  children,
  customClass,
}: CardProps) => {
  return (
    <AntdCard
      loading={loading}
      hoverable={hoverable}
      className={`card-layout ${customClass}`}
      style={{
        gap: `${flexGap}px`,
        padding: `${padding}px`,
        minHeight: `${height}px`,
        borderRadius: `${borderRadius}px`,
      }}
      onClick={onClick}
    >
      <div style={{ gap: `${flexGap}px` }} className="ant-card-body">
        {children}
      </div>
    </AntdCard>
  );
};

export default Card;
