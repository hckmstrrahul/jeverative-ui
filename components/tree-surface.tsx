'use client';
import { useEffect, useRef, type ComponentProps } from 'react';
/** Actual rendered height decides Mint's short-card radius, including streaming changes. */
export function MintSurface(props: ComponentProps<'section'>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      element.dataset.short = String(
        element.getBoundingClientRect().height < 60,
      );
    };
    const observer = new ResizeObserver(measure);
    measure();
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} {...props} />;
}
