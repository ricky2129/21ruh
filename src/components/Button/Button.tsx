import { Button as ButtonAntd } from "antd";
import cn from "classnames";

import "./button.styles.scss";

interface ButtonProps {
  title?: string | React.ReactNode;
  type?:
    | "primary"
    | "link"
    | "text"
    | "default"
    | "dashed"
    | "icon"
    | undefined;
  htmlType?: "button" | "submit" | "reset" | undefined;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  size?: "large" | "middle" | "small" | undefined;
  shape?: "default" | "circle" | "round";
  customClass?: string;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  onClick?: () => void;
  style?: React.CSSProperties;
  color?: "primary" | "default" | "danger";
  danger?: boolean;
  metaTitle?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  metaTitle = "",
  type = "primary",
  htmlType,
  loading = false,
  fullWidth = false,
  disabled = false,
  size = "large",
  shape = "default",
  icon,
  iconPosition = "start",
  customClass,
  style = {},
  color = "default",
  onClick,
  danger = false,
}: ButtonProps) => {
  const buttonType = type === "icon" ? "text" : type;

  return (
    <>
      {icon ? (
        <ButtonAntd
          title={metaTitle}
          type={buttonType}
          htmlType={htmlType}
          loading={loading}
          block={fullWidth}
          size={size}
          onClick={onClick}
          className={cn(customClass, "button", {
            "icon-button": type === "icon",
          })}
          icon={icon}
          iconPosition={iconPosition}
          disabled={disabled}
          style={style}
          color={color}
          danger={danger}
        >
          {title}
        </ButtonAntd>
      ) : (
        <ButtonAntd
          title={metaTitle}
          type={buttonType}
          htmlType={htmlType}
          loading={loading}
          disabled={disabled}
          block={fullWidth}
          size={size}
          shape={shape}
          onClick={onClick}
          className={cn(customClass, "button")}
          style={style}
          color={color}
          danger={danger}
        >
          {title}
        </ButtonAntd>
      )}
    </>
  );
};

export default Button;
