import { motion } from "motion/react";
import { useLite } from "../lib/useLite.ts";

type Tag = "h1" | "h2";

type Props = {
  lines: string[];
  as: Tag;
  className?: string;
  id?: string;
  inmediato?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({ lines, as: Tag, className, id, inmediato = false }: Props) {
  const lite = useLite();

  if (lite) {
    return (
      <Tag id={id} className={className}>
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            {...(inmediato
              ? { animate: { y: "0%" } }
              : { whileInView: { y: "0%" }, viewport: { once: true, margin: "0px 0px -8% 0px" } })}
            transition={{ duration: 0.85, delay: index * 0.08, ease }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
