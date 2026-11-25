import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Tip = { x: number; y: number; content: ReactNode } | null;

/** One chart's box: its measured width plus hover/focus tooltip state (positions relative to the box). */
export const useChartTip = () => {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [tip, setTip] = useState<Tip>(null);

  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);

  const show = useCallback(
    (e: { clientX: number; clientY: number }, content: ReactNode) => {
      const r = el?.getBoundingClientRect();
      if (r) setTip({ x: e.clientX - r.left, y: e.clientY - r.top, content });
    },
    [el],
  );
  /** Keyboard focus: anchor the tip to the focused element. */
  const showAt = useCallback(
    (target: Element, content: ReactNode) => {
      const r = el?.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      if (r) setTip({ x: t.left - r.left + t.width / 2, y: t.top - r.top, content });
    },
    [el],
  );
  const hide = useCallback(() => setTip(null), []);
  return { ref: setEl, width, tip, show, showAt, hide };
};
