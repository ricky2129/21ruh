import { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";

export type GenericIconType =
  | React.FC<SVGProps<SVGSVGElement>>
  | ForwardRefExoticComponent<
      Omit<AntdIconProps, "ref"> & RefAttributes<HTMLSpanElement>
    >;
