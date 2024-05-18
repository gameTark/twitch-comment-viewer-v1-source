"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import PerfectScrollbar from "perfect-scrollbar";

import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";

type PProps = ConstructorParameters<typeof PerfectScrollbar>[1];

export function Scroll(
  props: { children?: ReactNode; className?: string; noPadding?: boolean } & PProps,
) {
  const { children, className, ...pprops } = props;

  const scroll = usePerfectScrollbar([children, className], pprops);
  return (
    <div
      ref={scroll.ref}
      className={clsx(className, 'flex after:content-["_"] after:w-2 perfect-scrollbar-nopadding')}>
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
