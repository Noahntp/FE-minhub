import React, { useState, useEffect, useRef } from 'react';

interface CountUpNumberProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function CountUpNumber({ 
  target, 
  suffix = '', 
  prefix = '', 
  duration = 1600,
  className = 'tabular-nums'
}: CountUpNumberProps) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const startAnimation = () => {
      if (animatedRef.current || target <= 0) return;
      animatedRef.current = true;
      let startTimestamp: number | null = null;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic calculation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);

        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setCount(target);
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    // Fallback trigger if already in viewport
    startAnimation();

    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={containerRef} className={className}>
      {prefix}{(count || target).toLocaleString('vi-VN')}{suffix}
    </span>
  );
}
