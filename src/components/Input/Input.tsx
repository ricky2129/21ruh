import React, { LegacyRef } from "react";

import { Input as InputAntd, InputRef } from "antd";
import cn from "classnames";

import "./input.styles.scss";

interface PropsType {
  id?: string;
  value?: string;
  placeholder?: string;
  type?: "password" | "number" | "text" | "email";
  autoComplete?: string,
  customClass?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  maxLength?: number;
  disabled?: boolean;
  variant?: "outlined" | "filled" | "borderless";
  customRef?: LegacyRef<InputRef> | null;
  prefix?: React.ReactNode | null
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
}

const Input: React.FC<PropsType> = ({
  id,
  value,
  placeholder,
  type = "text",
  customClass,
  maxLength,
  onChange,
  onKeyDown,
  onFocus = () => {},
  onBlur = () => {},
  disabled = false,
  customRef = null,
  variant = "outlined",
  autoComplete = "on",
  prefix = null
}: PropsType) => {
  return (
    <InputAntd
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      type={type}
      className={cn("input", customClass)}
      id={id}
      maxLength={maxLength}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      disabled={disabled}
      ref={customRef}
      variant={variant}
      onBlur={onBlur}
      prefix={prefix}
      autoComplete={autoComplete}
    /> 
  );
};

export default Input;
