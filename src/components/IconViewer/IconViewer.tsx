import { GenericIconType } from "interfaces";

import { Colors } from "themes";

interface IconViewerProps {
  Icon: GenericIconType;
  size?: number;
  height?: number;
  width?: number;
  color?: string;
  disabled?: boolean;
  customClass?: string;
  onClick?: () => void;
}

/**
 * Renders an icon component with customizable size, color, and additional styling options.
 *
 * @param {GenericIconType} Icon - The icon component to render.
 * @param {number} [size=16] - The default size of the icon. This value is used if height and width are not specified.
 * @param {number} [height] - The height of the icon. Overrides the size if provided.
 * @param {number} [width] - The width of the icon. Overrides the size if provided.
 * @param {string} [color=Colors.TITLE_85] - The color of the icon.
 * @param {string} [customClass=""] - Additional CSS classes to apply to the icon.
 * @param {() => void} [onClick] - Callback function to handle click events on the icon.
 * @param {boolean} [disabled=false] - Indicates if the icon is disabled, affecting its styling and click behavior.
 *
 * @returns {React.ReactElement} A rendered icon element based on the provided properties.
 */
const IconViewer: React.FC<IconViewerProps> = ({
  Icon,
  size = 16,
  height,
  width,
  color = Colors.TITLE_85,
  customClass = "",
  onClick = () => {},
  disabled = false,
}: IconViewerProps) => {
  if (!Icon) return <></>;

  if (Icon?.displayName)
    return (
      <Icon
        style={{ fontSize: `${size}px`, color }}
        className={customClass}
        onClick={onClick}
        disabled={disabled}
      />
    );

  return (
    <Icon
      style={{ fontSize: `${size}px`, color }}
      height={height || size}
      width={width || height || size}
      fill={color}
      className={customClass}
      onClick={onClick}
      disabled={disabled}
    />
  );
};

export default IconViewer;
