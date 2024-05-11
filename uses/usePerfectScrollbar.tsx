import { DependencyList, useLayoutEffect, useRef } from "react";
import PerfectScrollbar from "perfect-scrollbar";

import { useInterval } from "./useInterval";

export const usePerfectScrollbar = (
  deps: DependencyList,
  options?: ConstructorParameters<typeof PerfectScrollbar>[1],
) => {
  const ref = useRef<HTMLDivElement>(null);
  const refScrollbar = useRef<PerfectScrollbar | null>(null);

  useLayoutEffect(() => {
    if (ref.current == null) return;
    const scroll = new PerfectScrollbar(ref.current, options);
    refScrollbar.current = scroll;
    scroll.update();

    const resize = new ResizeObserver(() => {
      scroll.update();
    });
    resize.observe(ref.current);
    return () => {
      if (refScrollbar.current == null) return;
      refScrollbar.current.destroy();
      refScrollbar.current = null;
      resize.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    refScrollbar.current?.update();
  }, deps);

  useInterval(
    () => {
      refScrollbar.current?.update();
    },
    {
      interval: 300,
      deps: [],
    },
  );
  return {
    ref,
    refScroll: refScrollbar,
  };
};
