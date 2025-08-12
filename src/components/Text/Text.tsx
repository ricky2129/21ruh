import React, { ReactNode } from "react";

import { Typography } from "antd";
import { EllipsisConfig } from "antd/es/typography/Base";
import classNames from "classnames";
import { TextType } from "constant/text.constants";

import { Colors } from "themes";

interface TitleProps {
  text: string | ReactNode;
  customClass?: string;
  type?:
    | "header1"
    | "header2"
    | "header3"
    | "title"
    | "subtitle"
    | "cardtitle"
    | "bodycopy"
    | "footnote"
    | "footnote2"
    | "caption";
  weight?: "regular" | "semibold" | "bold";
  color?: string;
  ellipsis?: EllipsisConfig | boolean;
  style?: React.CSSProperties;
  title?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const TitleLevelMap: Record<string, 1 | 2 | 3 | 4 | 5> = {
  [TextType.header1]: 1,
  [TextType.header2]: 2,
  [TextType.header3]: 3,
  [TextType.title]: 4,
  [TextType.subtitle]: 5,
};

const Text: React.FC<TitleProps> = ({
  text,
  type = "bodycopy",
  weight = "regular",
  color = Colors.BLACK,
  ellipsis,
  style,
  customClass,
  title = "",
  onClick = () => {},
  ...props
}: TitleProps) => {
  switch (type) {
    case TextType.header1:
    case TextType.header2:
    case TextType.header3:
    case TextType.title:
    case TextType.subtitle:
      return (
        <Typography.Title
          level={TitleLevelMap[type]}
          className={classNames(customClass, type, weight)}
          style={{ ...style, color }}
          ellipsis={ellipsis}
          onClick={onClick}
          title={title}
          {...props}
        >
          {text}
        </Typography.Title>
      );

    case TextType.cardtitle:
    case TextType.bodycopy:
    case TextType.footnote:
    case TextType.footnote2:
    case TextType.caption:
      return (
        <Typography.Text
          className={classNames(customClass, type, weight)}
          style={{ ...style, color }}
          ellipsis={ellipsis}
          onClick={onClick}
          title={title}
          {...props}
        >
          {text}
        </Typography.Text>
      );

    default:
      return (
        <Typography.Text
          className={classNames(customClass, weight)}
          style={{ ...style, color }}
          ellipsis={ellipsis}
          {...props}
          title={title}
        >
          {text}
        </Typography.Text>
      );
  }
};

export default Text;
