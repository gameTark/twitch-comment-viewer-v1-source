import { ReactNode } from "react";
import clsx from "clsx";

import { usePerfectScrollbar } from "@uses/usePerfectScrollbar";

export const Scroll = (props: { children?: ReactNode; className?: string }) => {
  const scroll = usePerfectScrollbar([props.children, props.className]);
  return (
    <div ref={scroll.ref} className={clsx("perfect-scrollbar", props.className)}>
      {props.children}
    </div>
  );
};
