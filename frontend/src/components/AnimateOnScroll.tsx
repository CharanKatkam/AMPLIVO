'use client';
import { useEffect, useRef, useState } from 'react';

type AnimationType = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-in' | 'fade-down';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;       // ms
  duration?: number;    // ms
  threshold?: number;   // 0–1
  className?: string;
  once?: boolean;
}

const animationClasses: Record<AnimationType, string> = {
  'fade-up':    'anim-fade-up',
  'fade-down':  'anim-fade-down',
  'fade-in':    'anim-fade-in',
  'fade-left':  'anim-fade-left',
  'fade-right': 'anim-fade-right',
  'scale-in':   'anim-scale-in',
};

export function AnimateOnScroll({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.12,
  className = '',
  once = true,
}: AnimateOnScrollProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? animationClasses[animation] : 'anim-hidden'}`}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: visible ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
}
