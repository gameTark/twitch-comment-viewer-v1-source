"use client";

import type { ConfigType, ManipulateType } from "dayjs";

import { dayjs } from "@libs/dayjs";

export const getHtml = (): HTMLHtmlElement => {
  return document.getElementsByTagName("html")[0];
};
export const isExists = (value: unknown) => !!value;
export const unique = <T>(args: T[]): T[] => {
  const items = new Set<T>();
  for (const arg of args) {
    items.add(arg);
  }
  return Array.from(items);
};

export const loop = (process: () => void, interval: number) => {
  let id: number | null = null;

  const loopEvent = async () => {
    await process();
    id = window.setTimeout(loopEvent, interval);
  };
  id = window.setTimeout(loopEvent, interval);

  return () => {
    if (id == null) return;
    window.clearTimeout(id);
  };
};

export const isTargetDateAgo = (props: {
  target: ConfigType;
  current?: ConfigType;
  num: number;
  ago: ManipulateType;
}) =>
  dayjs(props.target).isSameOrBefore(
    dayjs(props.current || new Date()).subtract(props.num, props.ago),
  );
