import { DependencyList, useLayoutEffect, useRef } from "react";
import PerfectScrollbar from "perfect-scrollbar";

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
    setTimeout(() => {
      scroll.update();
    }, 400);
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

  return {
    ref,
    refScroll: refScrollbar,
  };
};
