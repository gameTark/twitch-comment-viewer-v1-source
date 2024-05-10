import { ReactNode } from "react";
import clsx from "clsx";

// https://daisyui.com/components/badge/

/**
badge	Component	Container element
badge-neutral	Modifier	badge with `neutral` color
badge-primary	Modifier	badge with `primary` color
badge-secondary	Modifier	badge with `secondary` color
badge-accent	Modifier	badge with `accent` color
badge-ghost	Modifier	badge with `ghost` color
badge-info	Modifier	badge with `info` color
badge-success	Modifier	badge with `success` color
badge-warning	Modifier	badge with `warning` color
badge-error	Modifier	badge with `error` color
badge-outline	Modifier	transparent badge with [colorful] border
badge-lg	Responsive	badge with large size
badge-md	Responsive	badge with medium size (default)
badge-sm	Responsive	badge with small size
badge-xs	Responsive	badge with extra small size
 */

export type DasyBadgeType =
  | "badge-neutral"
  | "badge-primary"
  | "badge-secondary"
  | "badge-accent"
  | "badge-ghost"
  | "badge-info"
  | "badge-success"
  | "badge-warning"
  | "badge-error";
export const DasyBadge = (props: {
  type?: DasyBadgeType;
  outline?: boolean;
  size?: "badge-lg" | "badge-md" | "badge-sm" | "badge-xs";
  children: ReactNode;
}) => {
  return (
    <span className={clsx("badge", props.type, props.outline ? "badge-outline" : "", props.size)}>
      {props.children}
    </span>
  );
};
