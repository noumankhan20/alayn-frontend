"use client";

import { useEffect, useRef } from "react";
import React from "react";

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useReveal(options: UseRevealOptions = {}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  as?: string;
  style?: React.CSSProperties;
  id?: string;
}

export default function AnimatedText({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  style,
  id,
}: AnimatedTextProps) {
  const ref = useReveal();
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : "";

  return React.createElement(
    Tag,
    {
      ref,
      className: `reveal ${delayClass} ${className}`.trim(),
      style,
      id,
    },
    children
  );
}
