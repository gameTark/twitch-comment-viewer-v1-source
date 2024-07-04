import React, { ReactNode } from "react";
import clsx from "clsx";

const DiffProvider = (props: { children: ReactNode }) => {
  return (
    <div className="diff">
      {props.children}
      <div className=" diff-resizer" />
    </div>
  );
};
const Theme = (props: {
  children: ReactNode;
  theme1?: string;
  theme2?: string;
  className?: string;
}) => {
  return (
    <div className={clsx("diff", props.className || "aspect-square")}>
      <div className="diff-item-1" data-theme={props.theme2}>
        <div className=" overflow-hidden bg-base-100">{props.children}</div>
      </div>
      <div className=" diff-item-2" data-theme={props.theme1}>
        <div className=" overflow-hidden bg-base-100">{props.children}</div>
      </div>
      <div className=" diff-resizer" />
    </div>
  );
};
const ItemA = (props: { children: ReactNode; theme?: string }) => {
  return (
    <div className=" diff-item-1" data-theme={props.theme}>
      {props.children}
    </div>
  );
};
const ItemB = (props: { children: ReactNode; theme?: string }) => {
  return (
    <div className=" diff-item-2" data-theme={props.theme}>
      {props.children}
    </div>
  );
};

export const Diff = {
  Provider: DiffProvider,
  Theme,
  ItemA,
  ItemB,
};
