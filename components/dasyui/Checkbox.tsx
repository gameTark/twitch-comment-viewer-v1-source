import { ChangeEventHandler, useMemo } from "react";
import clsx from "clsx";

export interface CheckboxProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "error";
  onChange?: ChangeEventHandler<HTMLInputElement>;
  name?: string;
  value?: string;
  label?: string;
  chekced?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
}

export const Checkbox = (props: CheckboxProps) => {
  const size = useMemo(() => {
    switch (props.size) {
      case "xs":
        return "checkbox-xs";
      case "sm":
        return "checkbox-sm";
      case "md":
        return "checkbox-md";
      case "lg":
        return "checkbox-lg";
    }
  }, []);

  const color = useMemo(() => {
    switch (props.color) {
      case "accent":
        return "checkbox-accent";
      case "error":
        return "checkbox-error";
      case "info":
        return "checkbox-info";
      case "primary":
        return "checkbox-primary";
      case "secondary":
        return "checkbox-secondary";
      case "success":
        return "checkbox-success";
      case "warning":
        return "checkbox-warning";
    }
  }, []);

  return (
    <div className="form-control">
      <label className="label cursor-pointer">
        <input
          type="checkbox"
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          className={clsx("checkbox", size, color)}
          disabled={props.disabled}
          checked={props.chekced}
          defaultChecked={props.defaultChecked}
        />
        <p className="label-text px-4 text-left w-full">{props.label}</p>
      </label>
    </div>
  );
};
