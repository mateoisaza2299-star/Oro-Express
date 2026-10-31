import type { PointerEvent, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function GlowCard({ children, className = "" }: Props) {
  function onMove(event: PointerEvent<HTMLElement>) {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--gx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--gy", `${event.clientY - rect.top}px`);
  }

  return (
    <article onPointerMove={onMove} className={`glow-card ${className}`}>
      {children}
    </article>
  );
}
