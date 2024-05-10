// form-control	Component	Container element
// label	Component	For helper text
// select	Component	For <select> element
// select-bordered	Modifier	Adds border to select
// select-ghost	Modifier	Adds ghost style to select
// select-primary	Modifier	Adds `primary` color to select
// select-secondary	Modifier	Adds `secondary` color to select
// select-accent	Modifier	Adds `accent` color to select
// select-info	Modifier	Adds `info` color to select
// select-success	Modifier	Adds `success` color to select
// select-warning	Modifier	Adds `warning` color to select
// select-error	Modifier	Adds `error` color to select
// select-lg	Responsive	Large size for select
// select-md	Responsive	Medium (default) size for select
// select-sm	Responsive	Small size for select

import { ChangeEventHandler, ReactNode, useMemo } from "react";
import clsx from "clsx";

// select-xs	Responsive	Extra small size for select
export interface SelectProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "error" | "ghost";
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  name?: string;
  value?: string;
  label?: string;
  disabled?: boolean;
  bordered?: boolean;
  children?: ReactNode;
}
export const Select = (props: SelectProps) => {
  const size = useMemo(() => {
    switch (props.size) {
      case "xs":
        return "select-xs";
      case "sm":
        return "select-sm";
      case "md":
        return "select-md";
      case "lg":
        return "select-lg";
    }
  }, [props.size]);

  const color = useMemo(() => {
    switch (props.color) {
      case "accent":
        return "select-accent";
      case "error":
        return "select-error";
      case "info":
        return "select-info";
      case "primary":
        return "select-primary";
      case "secondary":
        return "select-secondary";
      case "success":
        return "select-success";
      case "warning":
        return "select-warning";
      case "ghost":
        return "select-ghost";
    }
  }, [props.color]);
  const bordered = useMemo(() => {
    if (props.bordered) return "select-bordered";
  }, [props.bordered]);
  return (
    <select
      className={clsx("select w-full max-w-xs", color, size, bordered)}
      disabled={props.disabled}
      name={props.name}
      onChange={props.onChange}>
      {props.children}
      {/* <option disabled selected>
        Who shot first?
      </option>
      <option>Han Solo</option>
      <option>Greedo</option> */}
    </select>
  );
};
