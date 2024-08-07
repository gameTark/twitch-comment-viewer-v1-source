"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import PerfectScrollbar from "perfect-scrollbar";

import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";

type PProps = ConstructorParameters<typeof PerfectScrollbar>[1];

export function Scroll(
  props: {
    children?: ReactNode;
    className?: string;
    noPadding?: boolean;
    borderd?: boolean;
  } & PProps,
) {
  const { children, className, ...otherProps } = props;

  const scroll = usePerfectScrollbar([children, className], otherProps);
  return (
    <div
      ref={scroll.ref}
      className={clsx(className, 'flex after:content-["_"] after:w-2 perfect-scrollbar-nopadding', {
        "border rounded-box rounded-r-none": props.borderd,
      })}>
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
