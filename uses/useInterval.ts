import { DependencyList, useEffect, useState } from "react";

export const useInterval = (
  handler: TimerHandler,
  {
    interval,
    deps,
    notFirst,
  }: {
    interval: number;
    deps: DependencyList;
    notFirst?: boolean;
  },
) => {
  useEffect(() => {
    if (!notFirst) {
      setTimeout(handler, 0);
    }
    const id = window.setInterval(handler, interval);
    return () => {
      window.clearTimeout(id);
    };
  }, [interval, ...deps]);
};
