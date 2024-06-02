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
const Theme = (props: { children: ReactNode; theme?: string; className?: string }) => {
  return (
    <div className={clsx("diff", props.className || "aspect-square")}>
      <div className=" diff-item-1">
        <div className=" overflow-hidden">{props.children}</div>
      </div>
      <div className=" diff-item-2" data-theme={props.theme}>
        <div className=" overflow-hidden">{props.children}</div>
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
