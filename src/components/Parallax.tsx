import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { ReactNode } from "react";
import { useLite } from "../lib/useLite.ts";

export function Parallax({ children }: { children: ReactNode }) {
  const lite = useLite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {lite ? (
        children
      ) : (
        <motion.div className="h-full w-full" style={{ y, scale: 1.08 }}>
          {children}
        </motion.div>
      )}
    </div>
  );
}
