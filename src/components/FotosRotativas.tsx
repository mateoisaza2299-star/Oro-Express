import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type Props = {
  /** Todas las fotos de la joya. La primera ya la pinta la tarjeta; aquí se pintan las demás. */
  galeria: string[] | undefined;
  /** Milisegundos que dura cada foto. */
  cada?: number;
};

/** Pasa por las fotos de una misma joya con un fundido. Sin movimiento si el usuario lo pidió. */
export function FotosRotativas({ galeria, cada = 3200 }: Props) {
  const reduce = useReducedMotion();
  const total = galeria?.length ?? 0;
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    if (total < 2 || reduce === true) return;
    const id = window.setInterval(() => setActiva((i) => (i + 1) % total), cada);
    return () => window.clearInterval(id);
  }, [total, reduce, cada]);

  if (!galeria || total < 2) return null;
  return (
    <>
      {galeria.slice(1).map((url, i) => (
        <img
          key={url}
          src={url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
            activa === i + 1 ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
