'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Wraps page content and plays a fade-in animation on every route change.
 * Uses a simple CSS keyframe so no extra dependencies are needed.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset and replay the animation on each route change
    el.style.animation = 'none';
    // Force reflow
    void el.offsetHeight;
    el.style.animation = '';
  }, [pathname]);

  return (
    <div ref={ref} className="page-transition-wrapper">
      {children}
    </div>
  );
}
