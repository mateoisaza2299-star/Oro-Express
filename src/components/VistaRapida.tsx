import { motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { copy } from "../content/es.ts";
import type { Producto } from "../data/productos.ts";
import { fuentes } from "../lib/imagen.ts";
import { setScrollLocked } from "../lib/scroll.ts";
import { useFocusTrap } from "../lib/useFocusTrap.ts";
import { useLite } from "../lib/useLite.ts";
import { mensajeConsulta, whatsappUrl } from "../lib/whatsapp.ts";

type Props = {
  producto: Producto;
  onClose: () => void;
};

export default function VistaRapida({ producto, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lite = useLite();
  const foto = fuentes(producto.imagen);
  const consulta = whatsappUrl(mensajeConsulta(producto.nombre, producto.categoria));

  useFocusTrap(true, ref, onClose);

  useEffect(() => {
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      initial={lite ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={lite ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <button type="button" className="absolute inset-0 bg-ink/50" aria-label={copy.ui.cerrarVista} onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vista-titulo"
        aria-describedby="vista-descripcion"
        data-testid="modal"
        data-lenis-prevent=""
        className="relative flex max-h-[100svh] w-full max-w-5xl flex-col overflow-y-auto bg-ivory sm:max-h-[90svh] md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:overflow-hidden"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-paper md:aspect-auto md:min-h-[32rem]">
          <motion.img
            {...foto}
            alt={producto.alt}
            sizes="(min-width: 768px) 40vw, 100vw"
            decoding="async"
            layoutId={lite ? undefined : `foto-${producto.id}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="relative px-5 py-6 md:overflow-y-auto md:px-8 md:py-8">
          <button
            type="button"
            className="absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center text-ink"
            aria-label={copy.ui.cerrar}
            onClick={onClose}
          >
            <X aria-hidden="true" size={22} strokeWidth={1.25} />
          </button>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">
            {producto.categoria}
            <span className="sr-only">. {copy.ui.galeria}.</span>
          </p>
          <p aria-hidden="true" className="mt-2 text-xs tracking-[0.18em] text-muted uppercase">
            {copy.ui.galeria}
          </p>
          <h2 id="vista-titulo" className="mt-3 pr-12 font-serif text-4xl leading-[1.05] font-medium text-ink">
            {producto.nombre}
          </h2>
          <dl className="mt-6 border-t border-gold-line/60">
            <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-gold-line/40 py-3 text-sm">
              <dt className="text-gold">{copy.vista.material}</dt>
              <dd>{producto.material}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-gold-line/40 py-3 text-sm">
              <dt className="text-gold">{copy.vista.precio}</dt>
              <dd>{producto.precio}</dd>
            </div>
          </dl>
          <p id="vista-descripcion" className="mt-6 text-base leading-relaxed text-muted">
            {producto.descripcion}
          </p>
          <a
            href={consulta}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="whatsapp-consulta"
            className="btn-shimmer mt-8 inline-flex min-h-12 items-center bg-ink px-5 text-xs tracking-[0.16em] text-ivory uppercase"
          >
            <span className="relative z-10">{copy.vista.asesoria}</span>
            <span className="shimmer" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
